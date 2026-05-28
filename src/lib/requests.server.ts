import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InstructorRequest {
  id: string;
  nome: string;
  usuario: string;
  email: string;
  status: "pending" | "approved" | "denied";
  createdAt: string;
  token: string;
}

// ---------------------------------------------------------------------------
// Simple JSON file persistence (works for self-hosted / Node deployments).
// Swap for a DB adapter if deploying to a serverless platform without a
// persistent filesystem (Cloudflare Workers, Vercel Edge, etc.).
// ---------------------------------------------------------------------------

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "requests.json");

function readData(): InstructorRequest[] {
  try {
    if (!existsSync(DATA_FILE)) return [];
    return JSON.parse(readFileSync(DATA_FILE, "utf-8")) as InstructorRequest[];
  } catch {
    return [];
  }
}

function writeData(data: InstructorRequest[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// Email helper — uses the Resend API.
// Required env vars:
//   RESEND_API_KEY   — your Resend secret key
//   VITE_APP_URL     — public base URL, e.g. https://cfc2026.seu-dominio.com
//   RESEND_FROM_EMAIL (optional) — defaults to onboarding@resend.dev (test only)
// ---------------------------------------------------------------------------

async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY não configurado — e-mail não enviado.");
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "CFC 2026 <onboarding@resend.dev>",
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[email] Resend error:", err);
    }
  } catch (e) {
    console.error("[email] Falha ao enviar e-mail:", e);
  }
}

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

export const submitInstructorRequest = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
      usuario: z.string().min(2, "Nome de guerra inválido"),
      email: z.string().email("E-mail inválido"),
    })
  )
  .handler(async ({ data }) => {
    const requests = readData();

    const existing = requests.find(
      (r) => r.usuario.toLowerCase() === data.usuario.toLowerCase()
    );
    if (existing) {
      return {
        ok: false as const,
        error:
          existing.status === "pending"
            ? ("already_pending" as const)
            : ("already_exists" as const),
      };
    }

    const token = crypto.randomUUID();
    const newRequest: InstructorRequest = {
      id: crypto.randomUUID(),
      nome: data.nome,
      usuario: data.usuario,
      email: data.email,
      status: "pending",
      createdAt: new Date().toISOString(),
      token,
    };

    requests.push(newRequest);
    writeData(requests);

    const baseUrl = process.env.VITE_APP_URL ?? "http://localhost:3000";
    const approveUrl = `${baseUrl}/autorizar?token=${token}&acao=aprovar`;
    const denyUrl = `${baseUrl}/autorizar?token=${token}&acao=negar`;

    await sendEmail({
      to: "joaopaulonepomuceno6@gmail.com",
      subject: `[CFC 2026] Solicitação de acesso — ${data.nome} (${data.usuario})`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#111;color:#eee;padding:32px;border-radius:8px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
            <div style="background:linear-gradient(135deg,#c8a84b,#f0d070);width:48px;height:48px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16px;color:#111;">EB</div>
            <div>
              <div style="font-weight:bold;letter-spacing:2px;color:#c8a84b;">CFC 2026</div>
              <div style="font-size:12px;color:#888;">Exército Brasileiro</div>
            </div>
          </div>
          <h2 style="color:#fff;margin-top:0;">Nova Solicitação de Acesso</h2>
          <p style="color:#ccc;">Um instrutor solicitou acesso à plataforma FO+ / FO-. Verifique os dados abaixo e autorize ou negue o acesso.</p>
          <table style="border-collapse:collapse;width:100%;margin:20px 0;font-size:14px;">
            <tr style="background:#1e1e1e;"><td style="padding:10px 12px;color:#888;width:160px;">Nome</td><td style="padding:10px 12px;font-weight:bold;">${data.nome}</td></tr>
            <tr style="background:#252525;"><td style="padding:10px 12px;color:#888;">Nome de Guerra</td><td style="padding:10px 12px;font-weight:bold;">${data.usuario}</td></tr>
            <tr style="background:#1e1e1e;"><td style="padding:10px 12px;color:#888;">E-mail</td><td style="padding:10px 12px;">${data.email}</td></tr>
            <tr style="background:#252525;"><td style="padding:10px 12px;color:#888;">Solicitado em</td><td style="padding:10px 12px;">${new Date().toLocaleString("pt-BR", { timeZone: "America/Manaus" })}</td></tr>
          </table>
          <div style="display:flex;gap:12px;margin-top:28px;">
            <a href="${approveUrl}" style="background:#2d6a1f;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">✅&nbsp; Autorizar Acesso</a>
            <a href="${denyUrl}" style="background:#8b1a1a;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">❌&nbsp; Negar Acesso</a>
          </div>
          <p style="color:#555;font-size:11px;margin-top:32px;border-top:1px solid #333;padding-top:16px;">CFC 2026 — Sistema FO+ / FO- · Exército Brasileiro · Acesso restrito</p>
        </div>
      `,
    });

    return { ok: true as const };
  });

export const processRequest = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().uuid(),
      acao: z.enum(["aprovar", "negar"]),
    })
  )
  .handler(async ({ data }) => {
    const requests = readData();
    const idx = requests.findIndex((r) => r.token === data.token);
    if (idx === -1) return { ok: false as const, error: "not_found" as const };

    const req = requests[idx];
    if (req.status !== "pending") {
      return {
        ok: false as const,
        error: "already_processed" as const,
        current: req.status,
        nome: req.nome,
      };
    }

    requests[idx].status = data.acao === "aprovar" ? "approved" : "denied";
    writeData(requests);

    const isApproved = data.acao === "aprovar";

    await sendEmail({
      to: req.email,
      subject: isApproved
        ? "[CFC 2026] Seu acesso foi autorizado!"
        : "[CFC 2026] Solicitação de acesso negada",
      html: isApproved
        ? `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;">
            <h2 style="color:#2d6a1f;">✅ Acesso Autorizado</h2>
            <p>Olá, <strong>${req.nome}</strong>!</p>
            <p>Sua solicitação de acesso ao CFC 2026 foi <strong>autorizada</strong>. Você já pode entrar na plataforma com o usuário <strong>${req.usuario}</strong>.</p>
            <p style="color:#888;font-size:12px;">CFC 2026 — Exército Brasileiro</p>
           </div>`
        : `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;">
            <h2 style="color:#8b1a1a;">❌ Acesso Negado</h2>
            <p>Olá, <strong>${req.nome}</strong>!</p>
            <p>Sua solicitação de acesso ao CFC 2026 foi <strong>negada</strong>. Entre em contato com o administrador para mais informações.</p>
            <p style="color:#888;font-size:12px;">CFC 2026 — Exército Brasileiro</p>
           </div>`,
    });

    return {
      ok: true as const,
      status: requests[idx].status,
      nome: req.nome,
      acao: data.acao,
    };
  });

export const checkInstructorApproval = createServerFn({ method: "POST" })
  .inputValidator(z.object({ usuario: z.string() }))
  .handler(async ({ data }) => {
    const requests = readData();
    const req = requests.find(
      (r) => r.usuario.toLowerCase() === data.usuario.toLowerCase()
    );
    if (!req) return { status: "not_found" as const };
    return { status: req.status as "pending" | "approved" | "denied" };
  });
