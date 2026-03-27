// POST /api/webhook/mp — MercadoPago IPN notification
export async function onRequestPost(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const body = await request.json().catch(() => ({}));

  const topic = body.type || url.searchParams.get("topic");
  const resourceId = body.data?.id || url.searchParams.get("id");

  if (topic === "payment" && resourceId) {
    const mpToken = env.MP_ACCESS_TOKEN;
    if (mpToken) {
      try {
        const payResp = await fetch(
          `https://api.mercadopago.com/v1/payments/${resourceId}`,
          { headers: { Authorization: `Bearer ${mpToken}` } }
        );
        const payment = await payResp.json();
        const extRef = payment.external_reference;
        const status = payment.status;

        if (extRef) {
          const statusMap = {
            approved: "paid",
            rejected: "cancelled",
            pending: "pending",
            in_process: "pending",
          };
          const newStatus = statusMap[status] || "pending";

          await env.DB.prepare(
            "UPDATE orders SET status = ?, mp_payment_id = ? WHERE id = ?"
          ).bind(newStatus, String(resourceId), parseInt(extRef)).run();
        }
      } catch (e) {
        // Log but don't fail
      }
    }
  }

  return Response.json({ ok: true });
}
