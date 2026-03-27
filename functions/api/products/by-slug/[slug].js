// GET /api/products/by-slug/:slug
export async function onRequestGet(context) {
  const { env, params } = context;
  const product = await env.DB.prepare("SELECT * FROM products WHERE slug = ?")
    .bind(params.slug).first();
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ...product, featured: !!product.featured });
}
