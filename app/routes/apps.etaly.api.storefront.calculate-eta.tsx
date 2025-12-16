import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "../../db.server";
import ETACalculator from "../../services/eta-calculator.server";

// Public API endpoint for storefront (no authentication required)
export async function action({ request }: ActionFunctionArgs) {
  try {
    // Get shop from request headers or cookies
    const shop = request.headers.get("X-Shop-Domain") ||
                 request.headers.get("Referer")?.match(/https?:\/\/([^\/]+)/)?.[1];

    if (!shop) {
      return json(
        {
          success: false,
          error: "Shop domain not found",
        },
        { status: 400 }
      );
    }

    // Find store
    const store = await db.store.findUnique({
      where: { shop },
    });

    if (!store || !store.isActive) {
      return json(
        {
          success: false,
          error: "Store not found or inactive",
        },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    const countryCode = formData.get("countryCode") as string;
    const postalCode = formData.get("postalCode") as string | undefined;
    const productId = formData.get("productId") as string | undefined;
    const variantId = formData.get("variantId") as string | undefined;

    if (!countryCode) {
      return json(
        {
          success: false,
          error: "Country code is required",
        },
        { status: 400 }
      );
    }

    // Calculate ETA
    const result = await ETACalculator.calculate({
      storeId: store.id,
      countryCode,
      postalCode,
      productId,
      variantId,
      orderDate: new Date(),
    });

    if (!result) {
      return json({
        success: false,
        error: "No matching delivery rule found for this location",
      });
    }

    // Return ETA data
    return json({
      success: true,
      eta: {
        message: result.message,
        minDate: result.minDate,
        maxDate: result.maxDate,
        minDays: result.minDays,
        maxDays: result.maxDays,
        ruleId: result.ruleId,
        ruleName: result.ruleName,
      },
    });
  } catch (error) {
    console.error("Storefront ETA calculation error:", error);
    return json(
      {
        success: false,
        error: "Failed to calculate ETA",
      },
      { status: 500 }
    );
  }
}
