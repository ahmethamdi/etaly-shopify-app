import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * GDPR Webhook: Customer Data Request
 * Shopify calls this when a customer requests their data
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`[GDPR] Received ${topic} for shop: ${shop}`);
  console.log(`[GDPR] Customer ID: ${payload.customer?.id}`);
  console.log(`[GDPR] Order IDs: ${payload.orders_requested?.join(", ")}`);

  // Log the request for compliance records
  try {
    await db.complianceLog.create({
      data: {
        shop,
        requestType: "customer_data_request",
        customerId: payload.customer?.id?.toString() || "",
        customerEmail: payload.customer?.email || "",
        requestedAt: new Date(),
        payload: JSON.stringify(payload),
      },
    });

    console.log(`[GDPR] Data request logged for customer ${payload.customer?.email}`);
  } catch (error) {
    console.error(`[GDPR] Failed to log data request:`, error);
  }

  // Note: You should implement actual data collection and delivery here
  // This is a placeholder that logs the request for manual processing
  // In production, you would:
  // 1. Collect all customer data from your database
  // 2. Format it according to GDPR requirements
  // 3. Send it to the customer via email or secure download link

  return new Response("OK", { status: 200 });
};
