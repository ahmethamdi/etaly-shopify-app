import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "../../db.server";

// Public API endpoint for analytics tracking (no authentication required)
export async function action({ request }: ActionFunctionArgs) {
  try {
    // Get shop from request headers
    const shop = request.headers.get("X-Shop-Domain") ||
                 request.headers.get("Referer")?.match(/https?:\/\/([^\/]+)/)?.[1];

    if (!shop) {
      return json({ success: false, error: "Shop domain not found" }, { status: 400 });
    }

    // Find store
    const store = await db.store.findUnique({
      where: { shop },
    });

    if (!store) {
      return json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const formData = await request.formData();

    const eventType = formData.get("eventType") as string; // impression, click, conversion
    const ruleId = formData.get("ruleId") as string | null;
    const productId = formData.get("productId") as string | null;
    const variantId = formData.get("variantId") as string | null;
    const countryCode = formData.get("countryCode") as string | null;
    const pageType = formData.get("pageType") as string | null;

    if (!eventType) {
      return json({ success: false, error: "Event type is required" }, { status: 400 });
    }

    // Create analytics record
    await db.analytics.create({
      data: {
        storeId: store.id,
        eventType,
        ruleId,
        productId,
        variantId,
        countryCode,
        pageType,
      },
    });

    return json({ success: true });
  } catch (error) {
    console.error("Storefront tracking error:", error);
    return json({ success: false, error: "Failed to track event" }, { status: 500 });
  }
}
