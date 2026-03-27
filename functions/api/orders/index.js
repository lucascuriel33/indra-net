// GET /api/orders (admin only)
export async function onRequestGet(context) {
  const { env, data } = context;
  if (!data.isAdmin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { results: orders } = await env.DB
    .prepare("SELECT * FROM orders ORDER BY created_at DESC").all();

  // Attach items to each order
  for (const order of orders) {
    const { results: items } = await env.DB
      .prepare("SELECT * FROM order_items WHERE order_id = ?")
      .bind(order.id).all();
    order.items = items.map(i => ({
      ...i,
      subtotal: i.quantity * i.unit_price
    }));
  }

  return Response.json(orders);
}
