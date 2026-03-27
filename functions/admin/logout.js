// GET /admin/logout — Clear admin cookie and redirect
export async function onRequestGet(context) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/admin.html",
      "Set-Cookie": "indra_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    },
  });
}
