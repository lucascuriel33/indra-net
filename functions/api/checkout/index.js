// POST /api/checkout — Create order + MercadoPago preference
export async function onRequestPost(context) {
  const { env, request } = context;
  const body = await request.json();
  const { items, email, name } = body;

  if (!items?.length || !email) {
    return Response.json({ error: "Missing items or email" }, { status: 400 });
  }

  // ── Build order ─────────────────────────────────────────────
  const orderResult = await env.DB.prepare(
    "INSERT INTO orders (customer_email, customer_name, status, total) VALUES (?, ?, 'pending', 0)"
  ).bind(email, name || "").run();
  const orderId = orderResult.meta.last_row_id;

  let total = 0;
  const mpItems = [];

  for (const item of items) {
    const product = await env.DB.prepare("SELECT * FROM products WHERE id = ?")
      .bind(item.product_id).first();
    if (!product) continue;

    const qty = parseInt(item.quantity) || 1;
    await env.DB.prepare(
      "INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES (?, ?, ?, ?, ?)"
    ).bind(orderId, product.id, product.name, qty, product.price).run();

    total += product.price * qty;
    mpItems.push({
      title: product.name,
      quantity: qty,
      unit_price: product.price,
      currency_id: env.CURRENCY || "ARS",
    });
  }

  total = Math.round(total * 100) / 100;
  await env.DB.prepare("UPDATE orders SET total = ? WHERE id = ?")
    .bind(total, orderId).run();

  // ── MercadoPago preference ──────────────────────────────────
  const mpToken = env.MP_ACCESS_TOKEN;
  if (mpToken) {
    const siteUrl = env.SITE_URL || new URL(request.url).origin;

    const prefBody = {
      items: mpItems,
      payer: { email, name: name || "" },
      back_urls: {
        success: `${siteUrl}/success.html`,
        failure: `${siteUrl}/failure.html`,
        pending: `${siteUrl}/pending.html`,
      },
      auto_return: "approved",
      external_reference: String(orderId),
      notification_url: `${siteUrl}/api/webhook/mp`,
    };

    try {
      const mpResp = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mpToken}`,
        },
        body: JSON.stringify(prefBody),
      });
      const pref = await mpResp.json();

      if (pref.id) {
        await env.DB.prepare("UPDATE orders SET mp_preference_id = ? WHERE id = ?")
          .bind(pref.id, orderId).run();
      }

      return Response.json({
        order_id: orderId,
        init_point: pref.init_point || "",
        sandbox_init_point: pref.sandbox_init_point || "",
      });
    } catch (e) {
      return Response.json({
        order_id: orderId,
        init_point: "",
        sandbox_init_point: "",
        message: "MercadoPago API call failed. Order saved.",
      });
    }
  }

  // No MP configured
  return Response.json({
    order_id: orderId,
    init_point: "",
    sandbox_init_point: "",
    message: "MercadoPago not configured. Order saved.",
  });
}
