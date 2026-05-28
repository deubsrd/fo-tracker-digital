import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { checkInstructorApproval } from "./requests.server";

// ---------------------------------------------------------------------------
// Types
// Monitor and Aluno have been removed — only Admin and Instrutor are valid.
// ---------------------------------------------------------------------------

export type Patente = "Admin" | "Instrutor";

export interface AuthUser {
  nome: string;
  patente: Patente;
  usuario: string;
}

export type LoginResult =
  | { ok: true }
  | { ok: false; reason: "pending" | "denied" | "not_found" };

interface AuthCtx {
  user: AuthUser | null;
  login: (usuario: string, senha: string, patente: Patente) => Promise<LoginResult>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

const STORAGE_KEY = "cfc2026.auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Rehydrate session from localStorage on first render
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      // ignore malformed JSON
    }
  }, []);

  const login = async (
    usuario: string,
    _senha: string,
    patente: Patente
  ): Promise<LoginResult> => {
    // Admins bypass the approval gate (direct access)
    if (patente === "Admin") {
      const u: AuthUser = { usuario, patente, nome: usuario.toUpperCase() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      setUser(u);
      return { ok: true };
    }

    // Instructors must have an approved request
    const result = await checkInstructorApproval({ data: { usuario } });

    if (result.status === "approved") {
      const u: AuthUser = { usuario, patente, nome: usuario.toUpperCase() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      setUser(u);
      return { ok: true };
    }

    return {
      ok: false,
      reason:
        result.status === "pending"
          ? "pending"
          : result.status === "denied"
            ? "denied"
            : "not_found",
    };
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
