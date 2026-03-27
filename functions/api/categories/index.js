// GET /api/categories
export async function onRequestGet(context) {
  const { results } = await context.env.DB
    .prepare("SELECT DISTINCT category FROM products WHERE category != '' ORDER BY category")
    .all();
  const cats = ["All", ...results.map(r => r.category)];
  return Response.json(cats);
}
