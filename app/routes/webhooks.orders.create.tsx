import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

    if (!admin || !session) {
      return new Response("Unauthorized", { status: 401 });
    }

    console.log(`Received ${topic} webhook for ${shop}`);

    // Get store
    const store = await db.store.findUnique({
      where: { shop },
    });

    if (!store) {
      console.error("Store not found for shop:", shop);
      return new Response("Store not found", { status: 404 });
    }

    // Extract order data
    const order = payload as any;
    const orderId = order.id?.toString();
    const orderValue = parseFloat(order.total_price || "0");

    // Get sessionId from order note attributes or cart attributes
    let sessionId: string | null = null;

    // Check note_attributes (Shopify Plus) or custom attributes
    if (order.note_attributes && Array.isArray(order.note_attributes)) {
      const sessionAttr = order.note_attributes.find(
        (attr: any) => attr.name === "etaly_session_id"
      );
      if (sessionAttr) {
        sessionId = sessionAttr.value;
      }
    }

    // Also check cart attributes
    if (!sessionId && order.cart_token) {
      // Generate a session ID from cart token if no explicit session ID
      sessionId = `cart_${order.cart_token}`;
    }

    // Get the most recent impression/click event for this session (if sessionId exists)
    let recentEvent = null;
    if (sessionId) {
      recentEvent = await db.analytics.findFirst({
        where: {
          storeId: store.id,
          sessionId,
          eventType: { in: ["impression", "click"] },
        },
        orderBy: {
          timestamp: "desc",
        },
      });
    }

    // Extract product info from order line items for better tracking
    const firstLineItem = order.line_items?.[0];
    const productId = firstLineItem?.product_id?.toString() || recentEvent?.productId;
    const variantId = firstLineItem?.variant_id?.toString() || recentEvent?.variantId;

    // Get country code from shipping address
    const countryCode = order.shipping_address?.country_code ||
                        order.billing_address?.country_code ||
                        recentEvent?.countryCode;

    // Create conversion event - always track orders even without session attribution
    await db.analytics.create({
      data: {
        storeId: store.id,
        eventType: "conversion",
        sessionId: sessionId || `order_${orderId}`, // Use order ID as fallback session
        ruleId: recentEvent?.ruleId,
        productId,
        variantId,
        countryCode,
        pageType: "checkout",
        orderId,
        orderValue,
        timestamp: new Date(),
      },
    });

    console.log(`Conversion tracked for order ${orderId}, sessionId: ${sessionId || 'unattributed'}`);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Order webhook error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
