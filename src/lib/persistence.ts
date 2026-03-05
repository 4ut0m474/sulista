export type PersistenceVerificationStatus =
  | "email_pending"
  | "identity_pending"
  | "pending"
  | "approved"
  | "rejected";

export interface PersistenceStatusPayload {
  userId?: string;
  status?: PersistenceVerificationStatus;
  verified?: boolean;
}

export const PERSISTENCE_KEYS = {
  active: "vento-sul-persistent",
  userId: "vento-sul-uuid",
  status: "vento-sul-persistence-status",
  pendingPin: "vento-sul-pending-pin",
  pendingEmail: "vento-sul-pending-email",
  pendingPersist: "vento-sul-pending-persist",
  pinVerified: "vento-sul-pin-verified",
  emailCookie: "vento_sul_email_verified",
} as const;

export const isPersistenceActiveStatus = (status?: PersistenceVerificationStatus | null) =>
  status === "identity_pending" || status === "pending" || status === "approved";

export const setPersistenceEmailCookie = (enabled: boolean) => {
  if (typeof document === "undefined") return;

  document.cookie = `${PERSISTENCE_KEYS.emailCookie}=${enabled ? "1" : "0"}; path=/; max-age=${enabled ? 60 * 60 * 24 * 365 : 0}; SameSite=Lax`;
};

export const syncPersistenceLocalState = ({ userId, status, verified }: PersistenceStatusPayload) => {
  if (typeof window === "undefined") return;

  const isActive = isPersistenceActiveStatus(status);
  localStorage.setItem(PERSISTENCE_KEYS.active, String(isActive));

  if (userId) {
    localStorage.setItem(PERSISTENCE_KEYS.userId, userId);
  }

  if (status) {
    localStorage.setItem(PERSISTENCE_KEYS.status, status);
  }

  sessionStorage.setItem(PERSISTENCE_KEYS.pinVerified, String(Boolean(verified || isActive)));
  setPersistenceEmailCookie(isActive);
};

export const clearPersistenceLocalState = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(PERSISTENCE_KEYS.active);
  localStorage.removeItem(PERSISTENCE_KEYS.userId);
  localStorage.removeItem(PERSISTENCE_KEYS.status);
  sessionStorage.removeItem(PERSISTENCE_KEYS.pinVerified);
  sessionStorage.removeItem(PERSISTENCE_KEYS.pendingPin);
  sessionStorage.removeItem(PERSISTENCE_KEYS.pendingEmail);
  sessionStorage.removeItem(PERSISTENCE_KEYS.pendingPersist);
  setPersistenceEmailCookie(false);
};

export const getLocalPersistenceActive = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PERSISTENCE_KEYS.active) === "true";
};

export const getLocalPersistenceStatus = (): PersistenceVerificationStatus | null => {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(PERSISTENCE_KEYS.status) as PersistenceVerificationStatus | null) ?? null;
};
