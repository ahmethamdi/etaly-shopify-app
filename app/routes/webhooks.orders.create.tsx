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

    // If no sessionId found, we can't attribute this conversion
    if (!sessionId) {
      console.log("No sessionId found in order, skipping conversion tracking");
      return new Response("OK", { status: 200 });
    }

    // Get the most recent impression/click event for this session to get productId and ruleId
    const recentEvent = await db.analytics.findFirst({
      where: {
        storeId: store.id,
        sessionId,
        eventType: { in: ["impression", "click"] },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Create conversion event
    await db.analytics.create({
      data: {
        storeId: store.id,
        eventType: "conversion",
        sessionId,
        ruleId: recentEvent?.ruleId,
        productId: recentEvent?.productId,
        variantId: recentEvent?.variantId,
        countryCode: recentEvent?.countryCode,
        pageType: "checkout",
        orderId,
        orderValue,
        timestamp: new Date(),
      },
    });

    console.log(`Conversion tracked for order ${orderId}, sessionId: ${sessionId}`);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Order webhook error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
