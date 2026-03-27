// PUT /api/orders/:id/status (admin only)
export async function onRequestPut(context) {
  const { env, params, request, data } = context;
  if (!data.isAdmin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const status = body.status;
  if (!status) return Response.json({ error: "Status required" }, { status: 400 });

  await env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?")
    .bind(status, params.id).run();

  const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?")
    .bind(params.id).first();
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });

  const { results: items } = await env.DB
    .prepare("SELECT * FROM order_items WHERE order_id = ?")
    .bind(params.id).all();
  order.items = items;

  return Response.json(order);
}
