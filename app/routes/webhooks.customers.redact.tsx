import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * GDPR Webhook: Customer Redaction
 * Shopify calls this 48 hours after a store owner requests customer data deletion
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`[GDPR] Received ${topic} for shop: ${shop}`);
  console.log(`[GDPR] Customer ID: ${payload.customer?.id}`);
  console.log(`[GDPR] Customer Email: ${payload.customer?.email}`);

  try {
    const customerId = payload.customer?.id?.toString();
    const customerEmail = payload.customer?.email;

    // Log the redaction request for compliance
    await db.complianceLog.create({
      data: {
        shop,
        requestType: "customer_redaction",
        customerId: customerId || "",
        customerEmail: customerEmail || "",
        requestedAt: new Date(),
        payload: JSON.stringify(payload),
      },
    });

    // Delete or anonymize all customer-related data
    // Note: ETAly doesn't store personal customer data directly,
    // but we should clean up any analytics that might reference this customer

    if (customerId) {
      // Delete analytics events related to this customer
      await db.analyticsEvent.deleteMany({
        where: {
          customerId: customerId,
        },
      });

      console.log(`[GDPR] Deleted analytics for customer ${customerId}`);
    }

    if (customerEmail) {
      // Delete any logs or records containing the customer email
      await db.analyticsEvent.deleteMany({
        where: {
          metadata: {
            path: ["customerEmail"],
            equals: customerEmail,
          },
        },
      });

      console.log(`[GDPR] Redacted data for email ${customerEmail}`);
    }

    console.log(`[GDPR] Customer redaction completed successfully`);
  } catch (error) {
    console.error(`[GDPR] Failed to process customer redaction:`, error);
    // Don't throw - we still return 200 to acknowledge receipt
  }

  return new Response("OK", { status: 200 });
};
