import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client (server-side usa process.env) ────────────────────────────

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env vars não configurados.");
  return createClient(url, key);
}

// ── Email helper ─────────────────────────────────────────────────────────────

async function sendEmail(opts: { to: string | string[]; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY não configurado — e-mail não enviado.");
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "CFC 2026 <onboarding@resend.dev>",
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });
    if (!res.ok) console.error("[email] Resend error:", await res.text());
  } catch (e) {
    console.error("[email] Falha ao enviar:", e);
  }
}

// ── Server functions ──────────────────────────────────────────────────────────

export const submitInstructorRequest = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      nome:    z.string().min(2),
      usuario: z.string().min(2),
      email:   z.string().email(),
    })
  )
  .handler(async ({ data }) => {
    const db = getSupabase();

    const { data: existing } = await db
      .from("instructor_requests")
      .select("status")
      .eq("usuario", data.usuario.toLowerCase())
      .maybeSingle();

    if (existing) {
      return {
        ok: false as const,
        error: existing.status === "pending" ? ("already_pending" as const) : ("already_exists" as const),
      };
    }

    const { data: req, error } = await db
      .from("instructor_requests")
      .insert({
        nome:    data.nome,
        usuario: data.usuario.toLowerCase(),
        email:   data.email,
        status:  "pending",
      })
      .select()
      .single();

    if (error) throw error;

    const baseUrl     = process.env.APP_URL ?? "http://localhost:3000";
    const approveUrl  = `${baseUrl}/autorizar?token=${req.token}&acao=aprovar`;
    const denyUrl     = `${baseUrl}/autorizar?token=${req.token}&acao=negar`;

    await sendEmail({
      to: "joaopaulonepomuceno6@gmail.com",
      subject: `[CFC 2026] Solicitação de acesso — ${data.nome} (${data.usuario})`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#111;color:#eee;padding:32px;border-radius:8px;">
          <h2 style="color:#fff;margin-top:0;">Nova Solicitação de Acesso</h2>
          <table style="border-collapse:collapse;width:100%;margin:16px 0;font-size:14px;">
            <tr style="background:#1e1e1e;"><td style="padding:10px;color:#888;width:140px;">Nome</td><td style="padding:10px;font-weight:bold;">${data.nome}</td></tr>
            <tr style="background:#252525;"><td style="padding:10px;color:#888;">Nome de Guerra</td><td style="padding:10px;font-weight:bold;">${data.usuario}</td></tr>
            <tr style="background:#1e1e1e;"><td style="padding:10px;color:#888;">E-mail</td><td style="padding:10px;">${data.email}</td></tr>
          </table>
          <div style="display:flex;gap:12px;margin-top:24px;">
            <a href="${approveUrl}" style="background:#2d6a1f;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">✅ Autorizar</a>
            <a href="${denyUrl}"    style="background:#8b1a1a;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">❌ Negar</a>
          </div>
        </div>`,
    });

    return { ok: true as const };
  });

export const processRequest = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().uuid(), acao: z.enum(["aprovar", "negar"]) }))
  .handler(async ({ data }) => {
    const db = getSupabase();

    const { data: req } = await db
      .from("instructor_requests")
      .select("*")
      .eq("token", data.token)
      .maybeSingle();

    if (!req) return { ok: false as const, error: "not_found" as const };
    if (req.status !== "pending") {
      return { ok: false as const, error: "already_processed" as const, current: req.status, nome: req.nome };
    }

    const newStatus = data.acao === "aprovar" ? "approved" : "denied";
    await db.from("instructor_requests").update({ status: newStatus }).eq("token", data.token);

    await sendEmail({
      to: req.email,
      subject: newStatus === "approved" ? "[CFC 2026] Acesso autorizado!" : "[CFC 2026] Acesso negado",
      html: newStatus === "approved"
        ? `<p>Olá, <strong>${req.nome}</strong>! Seu acesso foi <strong>autorizado</strong>. Acesse com o usuário <strong>${req.usuario}</strong>.</p>`
        : `<p>Olá, <strong>${req.nome}</strong>. Sua solicitação foi <strong>negada</strong>. Entre em contato com o administrador.</p>`,
    });

    return { ok: true as const, status: newStatus, nome: req.nome, acao: data.acao };
  });

export const checkInstructorApproval = createServerFn({ method: "POST" })
  .inputValidator(z.object({ usuario: z.string() }))
  .handler(async ({ data }) => {
    const db = getSupabase();
    const { data: req } = await db
      .from("instructor_requests")
      .select("status")
      .eq("usuario", data.usuario.toLowerCase())
      .maybeSingle();

    if (!req) return { status: "not_found" as const };
    return { status: req.status as "pending" | "approved" | "denied" };
  });
