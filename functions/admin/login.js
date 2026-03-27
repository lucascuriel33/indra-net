// POST /admin/login — Authenticate admin and set signed cookie
export async function onRequestPost(context) {
  const { env, request } = context;

  let body;
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    body = await request.json();
  } else {
    const form = await request.formData();
    body = { username: form.get("username"), password: form.get("password") };
  }

  const validUser = env.ADMIN_USERNAME || "admin";
  const validPass = env.ADMIN_PASSWORD || "indra2025";

  if (body.username !== validUser || body.password !== validPass) {
    if (contentType.includes("application/json")) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }
    return Response.redirect(new URL("/admin.html?error=1", request.url).toString(), 302);
  }

  // ── Generate signed token ─────────────────────────────────
  const secret = env.ADMIN_SECRET || "indra-default-secret";
  const payload = btoa(JSON.stringify({
    role: "admin",
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }));

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const token = `${payload}.${sigB64}`;
  const cookie = `indra_admin=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`;

  if (contentType.includes("application/json")) {
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookie,
      },
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/dashboard.html",
      "Set-Cookie": cookie,
    },
  });
}
