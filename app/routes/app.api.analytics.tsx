import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// GET - Fetch analytics data
export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    const url = new URL(request.url);
    const eventType = url.searchParams.get("eventType");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // Get or create store
    let store = await db.store.findUnique({
      where: { shop },
    });

    if (!store) {
      store = await db.store.create({
        data: {
          shop,
          plan: "free",
          isActive: true,
        },
      });
    }

    // Build query
    const whereClause: any = {
      storeId: store.id,
    };

    if (eventType) {
      whereClause.eventType = eventType;
    }

    if (startDate && endDate) {
      whereClause.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const analytics = await db.analytics.findMany({
      where: whereClause,
      orderBy: { timestamp: "desc" },
      take: 1000, // Limit to last 1000 events
    });

    // Calculate stats
    const stats = {
      totalImpressions: analytics.filter((a) => a.eventType === "impression").length,
      totalClicks: analytics.filter((a) => a.eventType === "click").length,
      totalConversions: analytics.filter((a) => a.eventType === "conversion").length,
      clickThroughRate: 0,
      conversionRate: 0,
    };

    if (stats.totalImpressions > 0) {
      stats.clickThroughRate = (stats.totalClicks / stats.totalImpressions) * 100;
      stats.conversionRate = (stats.totalConversions / stats.totalImpressions) * 100;
    }

    return json({
      success: true,
      analytics,
      stats,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return json(
      {
        success: false,
        error: "Failed to fetch analytics",
      },
      { status: 500 }
    );
  }
}

// POST - Track analytics event
export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    // Get or create store
    let store = await db.store.findUnique({
      where: { shop },
    });

    if (!store) {
      store = await db.store.create({
        data: {
          shop,
          plan: "free",
          isActive: true,
        },
      });
    }

    const formData = await request.formData();

    const eventType = formData.get("eventType") as string; // impression, click, conversion
    const ruleId = formData.get("ruleId") as string | null;
    const productId = formData.get("productId") as string | null;
    const variantId = formData.get("variantId") as string | null;
    const countryCode = formData.get("countryCode") as string | null;
    const pageType = formData.get("pageType") as string | null;
    const orderId = formData.get("orderId") as string | null;
    const orderValue = formData.get("orderValue")
      ? parseFloat(formData.get("orderValue") as string)
      : null;

    if (!eventType) {
      return json(
        {
          success: false,
          error: "Event type is required",
        },
        { status: 400 }
      );
    }

    // Create analytics record
    const analytics = await db.analytics.create({
      data: {
        storeId: store.id,
        eventType,
        ruleId,
        productId,
        variantId,
        countryCode,
        pageType,
        orderId,
        orderValue,
      },
    });

    return json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Error tracking analytics:", error);
    return json(
      {
        success: false,
        error: "Failed to track analytics",
      },
      { status: 500 }
    );
  }
}
