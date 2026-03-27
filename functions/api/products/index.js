// GET /api/products?category=&search=
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search");

  let sql = "SELECT * FROM products";
  const params = [];
  const conditions = [];

  if (category && category !== "All") {
    conditions.push("category = ?");
    params.push(category);
  }
  if (search) {
    conditions.push("name LIKE ?");
    params.push(`%${search}%`);
  }

  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  sql += " ORDER BY created_at DESC";

  const { results } = await env.DB.prepare(sql).bind(...params).all();
  return Response.json(results.map(r => ({ ...r, featured: !!r.featured })));
}

// POST /api/products (admin only)
export async function onRequestPost(context) {
  const { env, request, data } = context;
  if (!data.isAdmin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.name) return Response.json({ error: "Name required" }, { status: 400 });

  let slug = body.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[-\s]+/g, "-").trim();

  // Ensure unique slug
  const existing = await env.DB.prepare("SELECT id FROM products WHERE slug = ?").bind(slug).first();
  if (existing) slug = `${slug}-${Date.now() % 10000}`;

  const result = await env.DB.prepare(
    `INSERT INTO products (name, slug, description, price, image_url, category, stock, featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    body.name,
    slug,
    body.description || "",
    parseFloat(body.price) || 0,
    body.image_url || "",
    body.category || "General",
    parseInt(body.stock) || 0,
    body.featured ? 1 : 0
  ).run();

  const product = await env.DB.prepare("SELECT * FROM products WHERE id = ?")
    .bind(result.meta.last_row_id).first();
  return Response.json({ ...product, featured: !!product.featured }, { status: 201 });
}
