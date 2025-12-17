import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import ETACalculator from "../services/eta-calculator.server";

// POST - Calculate ETA for a product/order
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

    const countryCode = formData.get("countryCode") as string;
    const postalCode = formData.get("postalCode") as string | undefined;
    const productId = formData.get("productId") as string | undefined;
    const variantId = formData.get("variantId") as string | undefined;
    const orderDateStr = formData.get("orderDate") as string | undefined;

    if (!countryCode) {
      return json(
        {
          success: false,
          error: "Country code is required",
        },
        { status: 400 }
      );
    }

    const orderDate = orderDateStr ? new Date(orderDateStr) : new Date();

    // Calculate ETA
    const result = await ETACalculator.calculate({
      storeId: store.id,
      countryCode,
      postalCode,
      productId,
      variantId,
      orderDate,
    });

    if (!result) {
      return json({
        success: false,
        error: "No matching delivery rule found for this location",
      });
    }

    return json({
      success: true,
      eta: result,
    });
  } catch (error) {
    console.error("Error calculating ETA:", error);
    return json(
      {
        success: false,
        error: "Failed to calculate ETA",
      },
      { status: 500 }
    );
  }
}
