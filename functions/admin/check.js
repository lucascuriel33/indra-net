// GET /admin/check — Check if current session is admin
export async function onRequestGet(context) {
  return Response.json({ isAdmin: !!context.data.isAdmin });
}
