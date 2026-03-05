import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PIN_CREATE_REGEX = /^\d{6}$/;
const PIN_VERIFY_REGEX = /^\d{4,6}$/;
const DOCUMENT_REGEX = /^[0-9A-Za-z.\-/\s]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_IMAGE_LENGTH = 2_500_000;
const TEXT_ENCODER = new TextEncoder();

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function hashPin(pin: string, salt: string): Promise<string> {
  const data = TEXT_ENCODER.encode(pin + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeSecret(secret: string) {
  const secretBytes = TEXT_ENCODER.encode(secret);
  const keyBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i += 1) {
    keyBytes[i] = secretBytes[i % secretBytes.length] ?? 0;
  }
  return keyBytes;
}

async function getCryptoKey() {
  const secret = Deno.env.get("PERSISTENCE_ENCRYPTION_KEY");
  if (!secret) throw new Error("PERSISTENCE_ENCRYPTION_KEY is not configured");

  return crypto.subtle.importKey(
    "raw",
    normalizeSecret(secret),
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptText(value: string) {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = TEXT_ENCODER.encode(value);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, payload);
  return `${btoa(String.fromCharCode(...iv))}:${btoa(String.fromCharCode(...new Uint8Array(encrypted)))}`;
}

async function decryptText(value: string | null) {
  if (!value) return null;
  const [ivEncoded, dataEncoded] = value.split(":");
  if (!ivEncoded || !dataEncoded) return null;

  const key = await getCryptoKey();
  const iv = Uint8Array.from(atob(ivEncoded), (char) => char.charCodeAt(0));
  const data = Uint8Array.from(atob(dataEncoded), (char) => char.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

async function getAuthenticatedClients(authHeader: string) {
  const authedClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const {
    data: { user },
    error,
  } = await authedClient.auth.getUser();

  if (error || !user) {
    throw new Error("Não autorizado");
  }

  return { authedClient, adminClient, user };
}

async function ensureAdmin(authedClient: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await authedClient.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });

  if (error || !data) {
    throw new Error("Acesso restrito ao admin");
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Não autorizado" }, 401);
    }

    const { action, ...payload } = await req.json();
    const { authedClient, adminClient, user } = await getAuthenticatedClients(authHeader);

    if (action === "create") {
      const pin = typeof payload.pin === "string" ? payload.pin : "";
      const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : user.email?.toLowerCase();

      if (!PIN_CREATE_REGEX.test(pin)) {
        return jsonResponse({ error: "PIN deve ter exatamente 6 dígitos" }, 400);
      }

      if (!email) {
        return jsonResponse({ error: "E-mail não encontrado" }, 400);
      }

      const pinHash = await hashPin(pin, user.id);
      const { data: existingVerification } = await adminClient
        .from("persistence_verifications")
        .select("verification_status, verified")
        .eq("user_id", user.id)
        .maybeSingle();

      const nextStatus = existingVerification?.verification_status && existingVerification.verification_status !== "email_pending"
        ? existingVerification.verification_status
        : "identity_pending";

      const { error: verificationError } = await adminClient
        .from("persistence_verifications")
        .upsert(
          {
            user_id: user.id,
            email,
            pin_hash: pinHash,
            verification_status: nextStatus,
            verified: existingVerification?.verified ?? false,
          },
          { onConflict: "user_id" },
        );

      if (verificationError) {
        console.error("verificationError", verificationError);
        return jsonResponse({ error: "Erro ao salvar persistência" }, 500);
      }

      await adminClient.from("anonymous_profiles").upsert(
        { user_id: user.id, pin_hash: pinHash, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );

      const { data: existingWallet } = await adminClient
        .from("sulcoins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existingWallet) {
        await adminClient.from("sulcoins").insert({
          user_id: user.id,
          saldo: 50,
          atualizado_em: new Date().toISOString(),
        });

        await adminClient.from("sulcoins_log").insert({
          user_id: user.id,
          tipo: "bonus_persistencia",
          valor: 50,
          descricao: "Bônus de persistência - 0,50 SulC",
        });
      }

      return jsonResponse({
        success: true,
        uuid: user.id,
        status: nextStatus,
        verified: nextStatus === "approved",
      });
    }

    if (action === "status") {
      const { data: verification } = await adminClient
        .from("persistence_verifications")
        .select("email, verification_status, verified")
        .eq("user_id", user.id)
        .maybeSingle();

      if (verification) {
        return jsonResponse({
          uuid: user.id,
          email: verification.email,
          status: verification.verification_status,
          verified: verification.verified,
        });
      }

      const { data: legacyProfile } = await adminClient
        .from("anonymous_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (legacyProfile) {
        return jsonResponse({
          uuid: user.id,
          email: user.email,
          status: "approved",
          verified: true,
        });
      }

      return jsonResponse({ uuid: user.id, email: user.email, status: "email_pending", verified: false });
    }

    if (action === "verify") {
      const pin = typeof payload.pin === "string" ? payload.pin : "";
      if (!PIN_VERIFY_REGEX.test(pin)) {
        return jsonResponse({ error: "PIN inválido" }, 400);
      }

      const pinHash = await hashPin(pin, user.id);
      const { data: verification } = await adminClient
        .from("persistence_verifications")
        .select("pin_hash, verification_status, verified")
        .eq("user_id", user.id)
        .maybeSingle();

      if (verification?.pin_hash === pinHash) {
        return jsonResponse({
          success: true,
          valid: true,
          status: verification.verification_status,
          verified: verification.verified,
        });
      }

      const { data: legacyProfile } = await adminClient
        .from("anonymous_profiles")
        .select("pin_hash")
        .eq("user_id", user.id)
        .maybeSingle();

      if (legacyProfile?.pin_hash === pinHash) {
        return jsonResponse({ success: true, valid: true, status: "approved", verified: true });
      }

      return jsonResponse({ error: "PIN incorreto" }, 403);
    }

    if (action === "submit-identity") {
      const fullName = typeof payload.fullName === "string" ? payload.fullName.trim() : "";
      const documentType = payload.documentType === "rg" ? "rg" : "cpf";
      const documentId = typeof payload.documentId === "string" ? payload.documentId.trim() : "";
      const frontImage = typeof payload.frontImage === "string" ? payload.frontImage : "";
      const backImage = typeof payload.backImage === "string" ? payload.backImage : "";
      const selfieImage = typeof payload.selfieImage === "string" ? payload.selfieImage : "";

      if (fullName.length < 3 || fullName.length > 100) {
        return jsonResponse({ error: "Nome completo inválido" }, 400);
      }

      if (!DOCUMENT_REGEX.test(documentId) || documentId.length < 7 || documentId.length > 20) {
        return jsonResponse({ error: "Documento inválido" }, 400);
      }

      for (const image of [frontImage, backImage, selfieImage]) {
        if (!image.startsWith("data:image/") || image.length > MAX_IMAGE_LENGTH) {
          return jsonResponse({ error: "Uma das imagens é inválida ou muito grande" }, 400);
        }
      }

      const [fullNameEncrypted, documentIdEncrypted, frontImageEncrypted, backImageEncrypted, selfieImageEncrypted] = await Promise.all([
        encryptText(fullName),
        encryptText(documentId),
        encryptText(frontImage),
        encryptText(backImage),
        encryptText(selfieImage),
      ]);

      const { error } = await adminClient
        .from("persistence_verifications")
        .update({
          full_name_encrypted: fullNameEncrypted,
          document_id_encrypted: documentIdEncrypted,
          document_type: documentType,
          front_image_encrypted: frontImageEncrypted,
          back_image_encrypted: backImageEncrypted,
          selfie_image_encrypted: selfieImageEncrypted,
          verification_status: "pending",
          verified: false,
          rejection_reason: null,
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("submitIdentityError", error);
        return jsonResponse({ error: "Erro ao enviar verificação" }, 500);
      }

      return jsonResponse({ success: true, uuid: user.id, status: "pending", verified: false });
    }

    if (action === "admin-list") {
      await ensureAdmin(authedClient, user.id);

      const { data, error } = await adminClient
        .from("persistence_verifications")
        .select("id, email, document_type, verification_status, verified, created_at, full_name_encrypted, document_id_encrypted, front_image_encrypted, back_image_encrypted, selfie_image_encrypted")
        .eq("verification_status", "pending")
        .order("created_at", { ascending: true })
        .limit(20);

      if (error) {
        console.error("adminListError", error);
        return jsonResponse({ error: "Erro ao buscar verificações" }, 500);
      }

      const items = await Promise.all(
        (data || []).map(async (item) => ({
          id: item.id,
          email: item.email,
          fullName: (await decryptText(item.full_name_encrypted)) || "",
          documentId: (await decryptText(item.document_id_encrypted)) || "",
          documentType: item.document_type || "cpf",
          verification_status: item.verification_status,
          verified: item.verified,
          created_at: item.created_at,
          front_image: await decryptText(item.front_image_encrypted),
          back_image: await decryptText(item.back_image_encrypted),
          selfie_image: await decryptText(item.selfie_image_encrypted),
        })),
      );

      return jsonResponse({ items });
    }

    if (action === "admin-approve") {
      await ensureAdmin(authedClient, user.id);
      const requestId = typeof payload.requestId === "string" ? payload.requestId : "";

      if (!UUID_REGEX.test(requestId)) {
        return jsonResponse({ error: "Solicitação inválida" }, 400);
      }

      const { error } = await adminClient
        .from("persistence_verifications")
        .update({
          verification_status: "approved",
          verified: true,
          approved_at: new Date().toISOString(),
          approved_by: user.id,
          front_image_encrypted: null,
          back_image_encrypted: null,
          selfie_image_encrypted: null,
        })
        .eq("id", requestId);

      if (error) {
        console.error("adminApproveError", error);
        return jsonResponse({ error: "Erro ao aprovar persistência" }, 500);
      }

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Ação inválida" }, 400);
  } catch (err) {
    console.error("persist-anonymous error:", err);
    return jsonResponse({ error: err instanceof Error ? err.message : "Erro interno" }, 500);
  }
});
