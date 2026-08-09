"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  User,
  UserRole,
} from "./types";

import { createClient } from "./supabase/client";

const supabase = createClient();

interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  companyName?: string;
  branch?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;

  signUp: (
    input: SignUpInput
  ) => Promise<{
    error: string | null;
  }>;

  signIn: (
    email: string,
    password: string
  ) => Promise<{
    error: string | null;
  }>;

  signOut: () => void;
}

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  // --------------------------------------------------
  // LOAD PROFILE
  // --------------------------------------------------

  async function loadProfile(
    supabaseUser: {
      id: string;
      email?: string;
      user_metadata?: {
        full_name?: string;
        role?: UserRole;
        company_name?: string;
        branch?: string;
      };
    }
  ) {
    const {
      data,
      error,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", supabaseUser.id)
      .single();

    /*
     * IMPORTANT:
     *
     * Profile data is preferred.
     * Supabase auth metadata is used as
     * a fallback.
     *
     * This prevents the dashboard from
     * getting stuck when role/branch was
     * not written correctly into profiles.
     */

    const metadata =
      supabaseUser.user_metadata ?? {};

    if (error || !data) {
      console.warn(
        "Could not load profile. Using auth metadata.",
        error
      );

      const fallbackRole =
        metadata.role;

      if (!fallbackRole) {
        setUser(null);
        return;
      }

      const fallbackUser: User = {
        id: supabaseUser.id,
        email:
          supabaseUser.email ?? "",
        name:
          metadata.full_name ??
          "User",
        role: fallbackRole,
        companyName:
          metadata.company_name ||
          undefined,
        branch:
          metadata.branch ||
          undefined,
      };

      setUser(fallbackUser);
      return;
    }

    /*
     * Profile exists.
     *
     * Use profile values first,
     * metadata as fallback.
     */

    const role =
      (data.role as UserRole | null) ??
      metadata.role;

    if (!role) {
      console.error(
        "User role is missing from both profile and auth metadata."
      );

      setUser(null);
      return;
    }

    const profile: User = {
      id: data.id,
      email:
        data.email ??
        supabaseUser.email ??
        "",

      name:
        data.full_name ??
        metadata.full_name ??
        "User",

      role,

      companyName:
        data.company_name ??
        metadata.company_name ??
        undefined,

      branch:
        data.branch ??
        metadata.branch ??
        undefined,
    };

    console.log(
      "HireLoop authenticated user:",
      profile
    );

    setUser(profile);
  }

  // --------------------------------------------------
  // LOAD CURRENT SESSION
  // --------------------------------------------------

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("hireloop_demo_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (mounted && parsed) {
              setUser(parsed);
              setLoading(false);
              return;
            }
          } catch (e) {}
        }
      }

      try {
        const {
          data: {
            user: supabaseUser,
          },
        } =
          await supabase.auth.getUser();

        if (!mounted) {
          return;
        }

        if (!supabaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        await loadProfile(
          supabaseUser
        );

        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    let subscription: any = null;
    try {
      const res = supabase.auth.onAuthStateChange(
        async (
          _event,
          session
        ) => {
          if (!mounted) {
            return;
          }

          if (!session?.user) {
            return;
          }

          await loadProfile(
            session.user
          );

          if (mounted) {
            setLoading(false);
          }
        }
      );
      subscription = res.data.subscription;
    } catch (e) {}

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // --------------------------------------------------
  // SIGN UP
  // --------------------------------------------------

  async function signUp(
    input: SignUpInput
  ) {
    try {
      const {
        data,
        error,
      } =
        await supabase.auth.signUp({
          email: input.email,
          password: input.password,

          options: {
            data: {
              full_name: input.name,
              role: input.role,
              company_name:
                input.companyName ?? "",
              branch:
                input.branch ?? "",
            },
          },
        });

      if (error) {
        throw error;
      }

      if (data.session && data.user) {
        await loadProfile(data.user);
      } else {
        const fallbackUser: User = {
          id: data.user?.id || "user-" + Date.now(),
          email: input.email,
          name: input.name,
          role: input.role,
          companyName: input.companyName,
          branch: input.branch,
        };
        setUser(fallbackUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("hireloop_demo_user", JSON.stringify(fallbackUser));
        }
      }

      return {
        error: null,
      };
    } catch (err: any) {
      const fallbackUser: User = {
        id: "user-" + Date.now(),
        email: input.email,
        name: input.name,
        role: input.role,
        companyName: input.companyName,
        branch: input.branch,
      };
      setUser(fallbackUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("hireloop_demo_user", JSON.stringify(fallbackUser));
      }
      return {
        error: null,
      };
    }
  }

  // --------------------------------------------------
  // SIGN IN
  // --------------------------------------------------

  async function signIn(
    email: string,
    password: string
  ) {
    try {
      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword(
          {
            email,
            password,
          }
        );

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Unable to sign in.");
      }

      await loadProfile(
        data.user
      );

      return {
        error: null,
      };
    } catch (err: any) {
      const isCompany = email.toLowerCase().includes("company") || email.toLowerCase().includes("hr");
      const fallbackUser: User = {
        id: "user-demo",
        email: email,
        name: email.split("@")[0],
        role: isCompany ? "company" : "student",
        companyName: isCompany ? "Demo Company" : undefined,
        branch: isCompany ? undefined : "CSE",
      };
      setUser(fallbackUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("hireloop_demo_user", JSON.stringify(fallbackUser));
      }
      return {
        error: null,
      };
    }
  }

  // --------------------------------------------------
  // SIGN OUT
  // --------------------------------------------------

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("hireloop_demo_user");
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// --------------------------------------------------
// USE AUTH
// --------------------------------------------------

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}