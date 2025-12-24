import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * GDPR Webhook: Shop Redaction
 * Shopify calls this 48 hours after a store uninstalls the app
 * We must delete all store data
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`[GDPR] Received ${topic} for shop: ${shop}`);
  console.log(`[GDPR] Shop domain: ${payload.shop_domain}`);

  try {
    // Find the store
    const store = await db.store.findUnique({
      where: { shop },
    });

    if (!store) {
      console.log(`[GDPR] Store ${shop} not found - already deleted`);
      return new Response("OK", { status: 200 });
    }

    // Log the redaction request
    await db.complianceLog.create({
      data: {
        shop,
        requestType: "shop_redaction",
        customerId: "",
        customerEmail: "",
        requestedAt: new Date(),
        payload: JSON.stringify(payload),
      },
    });

    // Delete all store-related data in the correct order (foreign key constraints)

    // 1. Delete analytics events
    await db.analyticsEvent.deleteMany({
      where: { storeId: store.id },
    });
    console.log(`[GDPR] Deleted analytics events for ${shop}`);

    // 2. Delete analytics (legacy)
    await db.analytics.deleteMany({
      where: { storeId: store.id },
    });
    console.log(`[GDPR] Deleted analytics for ${shop}`);

    // 3. Delete product targeting
    await db.productTargeting.deleteMany({
      where: { storeId: store.id },
    });
    console.log(`[GDPR] Deleted product targeting for ${shop}`);

    // 4. Delete delivery rules
    await db.deliveryRule.deleteMany({
      where: { storeId: store.id },
    });
    console.log(`[GDPR] Deleted delivery rules for ${shop}`);

    // 5. Delete message templates (custom only)
    await db.messageTemplate.deleteMany({
      where: { storeId: store.id, isBuiltIn: false },
    });
    console.log(`[GDPR] Deleted custom message templates for ${shop}`);

    // 6. Delete holidays
    await db.holiday.deleteMany({
      where: { storeId: store.id },
    });
    console.log(`[GDPR] Deleted holidays for ${shop}`);

    // 7. Delete cart/checkout settings
    await db.cartCheckoutSettings.deleteMany({
      where: { storeId: store.id },
    });
    console.log(`[GDPR] Deleted cart/checkout settings for ${shop}`);

    // 8. Delete settings
    await db.settings.deleteMany({
      where: { storeId: store.id },
    });
    console.log(`[GDPR] Deleted settings for ${shop}`);

    // 9. Delete sessions
    await db.session.deleteMany({
      where: { shop },
    });
    console.log(`[GDPR] Deleted sessions for ${shop}`);

    // 10. Finally, delete the store record
    await db.store.delete({
      where: { id: store.id },
    });
    console.log(`[GDPR] Deleted store record for ${shop}`);

    console.log(`[GDPR] Shop redaction completed successfully for ${shop}`);
  } catch (error) {
    console.error(`[GDPR] Failed to process shop redaction:`, error);
    // Don't throw - we still return 200 to acknowledge receipt
    // Log the error for manual follow-up
  }

  return new Response("OK", { status: 200 });
};
