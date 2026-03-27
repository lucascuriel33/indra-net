// ══════════════════════════════════════════════════════════════
// Indra Net — Global Middleware
// ══════════════════════════════════════════════════════════════
// Parses admin auth cookie + sets CORS headers for API routes.

export async function onRequest(context) {
  const { request, env, next } = context;

  // ── Parse admin token from cookie ─────────────────────────
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/indra_admin=([^;]+)/);
  context.data = context.data || {};
  context.data.isAdmin = false;

  if (match) {
    try {
      const token = match[1];
      const secret = env.ADMIN_SECRET || "indra-default-secret";
      const [payload, sig] = token.split(".");
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const expected = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(payload)
      );
      const expectedB64 = btoa(String.fromCharCode(...new Uint8Array(expected)))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

      if (expectedB64 === sig) {
        const data = JSON.parse(atob(payload));
        if (data.role === "admin" && data.exp > Date.now()) {
          context.data.isAdmin = true;
        }
      }
    } catch (e) {
      // Invalid token — ignore
    }
  }

  // ── Execute the actual handler ─────────────────────────────
  const response = await next();

  // ── CORS for API routes ────────────────────────────────────
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  }

  return response;
}
