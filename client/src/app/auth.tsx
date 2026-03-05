import React, { createContext, useContext, useMemo, useState } from "react";

type Role = "admin" | "worker" | "user";
type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  nickname?: string;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
};
type AuthState = {
  user: User | null;
  token: string | null;
  login: (data: { user: User; token: string }) => void;
  logout: () => void;
};

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("dg_token"));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("dg_user");
    return raw ? JSON.parse(raw) : null;
  });

  const value = useMemo<AuthState>(() => ({
    user,
    token,
    login: ({ user, token }) => {
      setUser(user);
      setToken(token);
      localStorage.setItem("dg_user", JSON.stringify(user));
      localStorage.setItem("dg_token", token);
    },
    logout: () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem("dg_user");
      localStorage.removeItem("dg_token");
    }
  }), [user, token]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (ctx === null) {
    throw new Error("useAuth() usado fuera de <AuthProvider>. Revisa main.tsx.");
  }
  return ctx;
}

