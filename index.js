/**
 * Cloudflare Worker — proxy entre o site (GitHub Pages) e as APIs de IA.
 *
 * Por quê isso existe: o site é estático (GitHub Pages), então qualquer chave de API colocada
 * direto no JavaScript do site fica visível pra qualquer visitante que abrir o código-fonte.
 * Este worker fica no meio: recebe o pedido do site, anexa a chave (guardada aqui, nunca no
 * navegador) e repassa pra API de verdade.
 *
 * Rotas:
 *   POST /roteiro  → repassa para a API da Anthropic (gera o texto do carrossel)
 *   POST /imagem   → repassa para a API do Gemini/Nano Banana (gera imagem de fundo, opcional)
 *
 * Configuração necessária no painel do Cloudflare (ver README.md, passo 3):
 *   Secrets:   ANTHROPIC_API_KEY, GEMINI_API_KEY
 *   Variável:  ALLOWED_ORIGIN  (a URL do site, ex: https://roberthjhoww.github.io)
 */

const ANTHROPIC_MODEL = "claude-sonnet-5";
const GEMINI_MODEL = "gemini-3.1-flash-image";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = origin === env.ALLOWED_ORIGIN;

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowed ? origin : "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (!allowed) {
      return new Response("Origem não autorizada", { status: 403, headers: corsHeaders });
    }
    if (request.method !== "POST") {
      return new Response("Método não permitido", { status: 405, headers: corsHeaders });
    }

    const { pathname } = new URL(request.url);
    const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

    try {
      if (pathname === "/roteiro") return await proxyRoteiro(request, env, jsonHeaders);
      if (pathname === "/imagem") return await proxyImagem(request, env, jsonHeaders);
      return new Response(JSON.stringify({ error: "rota não encontrada" }), { status: 404, headers: jsonHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: jsonHeaders });
    }
  },
};

// Espera do site: { system: "...", messages: [{role:"user", content:"..."}] }
async function proxyRoteiro(request, env, headers) {
  const body = await request.json();
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      system: body.system || "",
      messages: body.messages || [],
    }),
  });
  return new Response(await resp.text(), { status: resp.status, headers });
}

// Espera do site: { prompt: "..." }
async function proxyImagem(request, env, headers) {
  const body = await request.json();
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: body.prompt || "" }] }] }),
    }
  );
  return new Response(await resp.text(), { status: resp.status, headers });
}
