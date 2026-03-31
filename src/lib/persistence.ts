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
  emailCookie: "vento_sul_email_verified",
} as const;

export const isPersistenceActiveStatus = (status?: PersistenceVerificationStatus | null) =>
  status === "identity_pending" || status === "pending" || status === "approved";

export const setPersistenceEmailCookie = (enabled: boolean) => {
  if (typeof document === "undefined") return;
  document.cookie = `${PERSISTENCE_KEYS.emailCookie}=${enabled ? "1" : "0"}; path=/; max-age=${enabled ? 60 * 60 * 24 * 365 : 0}; SameSite=Lax`;
};

export const syncPersistenceLocalState = ({ userId, status }: PersistenceStatusPayload) => {
  if (typeof window === "undefined") return;
  const isActive = isPersistenceActiveStatus(status);
  localStorage.setItem(PERSISTENCE_KEYS.active, String(isActive));
  if (userId) localStorage.setItem(PERSISTENCE_KEYS.userId, userId);
  if (status) localStorage.setItem(PERSISTENCE_KEYS.status, status);
  setPersistenceEmailCookie(isActive);
};

export const clearPersistenceLocalState = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PERSISTENCE_KEYS.active);
  localStorage.removeItem(PERSISTENCE_KEYS.userId);
  localStorage.removeItem(PERSISTENCE_KEYS.status);
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
