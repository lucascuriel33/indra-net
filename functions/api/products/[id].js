// GET /api/products/:id
export async function onRequestGet(context) {
  const { env, params } = context;
  const product = await env.DB.prepare("SELECT * FROM products WHERE id = ?")
    .bind(params.id).first();
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ...product, featured: !!product.featured });
}

// PUT /api/products/:id (admin only)
export async function onRequestPut(context) {
  const { env, params, request, data } = context;
  if (!data.isAdmin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const product = await env.DB.prepare("SELECT * FROM products WHERE id = ?")
    .bind(params.id).first();
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  let slug = product.slug;
  if (body.name && body.name !== product.name) {
    slug = body.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[-\s]+/g, "-").trim();
    const existing = await env.DB.prepare("SELECT id FROM products WHERE slug = ? AND id != ?")
      .bind(slug, params.id).first();
    if (existing) slug = `${slug}-${params.id}`;
  }

  await env.DB.prepare(
    `UPDATE products SET name=?, slug=?, description=?, price=?, image_url=?, category=?, stock=?, featured=?
     WHERE id=?`
  ).bind(
    body.name ?? product.name,
    slug,
    body.description ?? product.description,
    parseFloat(body.price ?? product.price),
    body.image_url ?? product.image_url,
    body.category ?? product.category,
    parseInt(body.stock ?? product.stock),
    body.featured !== undefined ? (body.featured ? 1 : 0) : product.featured,
    params.id
  ).run();

  const updated = await env.DB.prepare("SELECT * FROM products WHERE id = ?")
    .bind(params.id).first();
  return Response.json({ ...updated, featured: !!updated.featured });
}

// DELETE /api/products/:id (admin only)
export async function onRequestDelete(context) {
  const { env, params, data } = context;
  if (!data.isAdmin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(params.id).run();
  return Response.json({ ok: true });
}
