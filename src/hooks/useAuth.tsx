import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "vendor" | "buyer" | "super_admin";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  profile: {
    id: string;
    full_name: string | null;
    email: string | null;
    account_type: string | null;
    avatar_url: string | null;
    phone: string | null;
    bio: string | null;
  } | null;
  hasRole: (role: AppRole) => boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  isBuyer: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, email, account_type, avatar_url, phone, bio")
        .eq("id", userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (rolesData) {
        setRoles(rolesData.map((r) => r.role as AppRole));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const refreshAuth = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
      await fetchUserData(currentSession.user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Defer Supabase calls with setTimeout to avoid deadlock
          setTimeout(() => {
            fetchUserData(currentSession.user.id);
          }, 0);
        } else {
          setRoles([]);
          setProfile(null);
        }

        if (event === "SIGNED_OUT") {
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        fetchUserData(existingSession.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (role: AppRole) => roles.includes(role);
  const isSuperAdmin = hasRole("super_admin");
  const isAdmin = hasRole("admin") || isSuperAdmin;
  const isVendor = hasRole("vendor");
  const isBuyer = hasRole("buyer");

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        roles,
        profile,
        hasRole,
        isSuperAdmin,
        isAdmin,
        isVendor,
        isBuyer,
        signOut,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
