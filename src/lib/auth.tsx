import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Patente = "Admin" | "Instrutor" | "Monitor" | "Aluno";

export interface AuthUser {
  nome: string;
  patente: Patente;
  usuario: string;
}

interface AuthCtx {
  user: AuthUser | null;
  login: (usuario: string, _senha: string, patente: Patente) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

const STORAGE_KEY = "cfc2026.auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const login = (usuario: string, _senha: string, patente: Patente) => {
    const u: AuthUser = {
      usuario,
      patente,
      nome: usuario.toUpperCase(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
