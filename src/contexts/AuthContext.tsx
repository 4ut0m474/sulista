import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { PERSISTENCE_KEYS, getLocalPersistenceActive } from "@/lib/persistence";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isPersistent: boolean;
  pinVerified: boolean;
  /** Whether PIN gate should block the UI */
  needsPinGate: boolean;
  /** Call after successful PIN verification */
  confirmPin: () => void;
  /** Call to clear pin verification (e.g. on logout) */
  clearPin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isPersistent: false,
  pinVerified: false,
  needsPinGate: false,
  confirmPin: () => {},
  clearPin: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinVerified, setPinVerified] = useState(
    sessionStorage.getItem(PERSISTENCE_KEYS.pinVerified) === "true"
  );

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isPersistent = getLocalPersistenceActive();

  // PIN gate: persistent user with active session but PIN not yet verified this session
  const needsPinGate = isPersistent && !!session && !pinVerified;

  const confirmPin = useCallback(() => {
    setPinVerified(true);
    sessionStorage.setItem(PERSISTENCE_KEYS.pinVerified, "true");
  }, []);

  const clearPin = useCallback(() => {
    setPinVerified(false);
    sessionStorage.removeItem(PERSISTENCE_KEYS.pinVerified);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, isPersistent, pinVerified, needsPinGate, confirmPin, clearPin }}>
      {children}
    </AuthContext.Provider>
  );
};
