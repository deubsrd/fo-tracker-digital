// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    // Lovable não aceita variáveis com prefixo VITE_ no painel de Secrets.
    // Aqui mapeamos os nomes sem prefixo (SUPABASE_URL, SUPABASE_ANON_KEY)
    // para as variáveis que o cliente Supabase lê via import.meta.env.
    define: {
      "import.meta.env.VITE_SUPABASE_URL":
        JSON.stringify(process.env.SUPABASE_URL ?? ""),
      "import.meta.env.VITE_SUPABASE_ANON_KEY":
        JSON.stringify(process.env.SUPABASE_ANON_KEY ?? ""),
    },
  },
});
