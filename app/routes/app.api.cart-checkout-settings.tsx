import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// GET - Load cart & checkout settings
export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    // Get or create store
    let store = await db.store.findUnique({
      where: { shop },
      include: {
        cartCheckoutSettings: true,
      },
    });

    if (!store) {
      store = await db.store.create({
        data: {
          shop,
          plan: "free",
          isActive: true,
        },
        include: {
          cartCheckoutSettings: true,
        },
      });
    }

    // If no settings exist, create default settings
    if (!store.cartCheckoutSettings) {
      const settings = await db.cartCheckoutSettings.create({
        data: {
          storeId: store.id,
          cartEnabled: true,
          cartPosition: "under_product_title",
          cartStyle: "info",
          cartAggregation: "latest",
          checkoutEnabled: true,
          checkoutPosition: "order_summary_section",
          checkoutStyle: "success",
        },
      });

      return json({
        success: true,
        settings,
      });
    }

    return json({
      success: true,
      settings: store.cartCheckoutSettings,
    });
  } catch (error) {
    console.error("Error fetching cart-checkout settings:", error);
    return json(
      {
        success: false,
        error: "Failed to fetch cart-checkout settings",
      },
      { status: 500 }
    );
  }
}

// POST - Update cart & checkout settings
export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    // Get or create store
    let store = await db.store.findUnique({
      where: { shop },
      include: {
        cartCheckoutSettings: true,
      },
    });

    if (!store) {
      store = await db.store.create({
        data: {
          shop,
          plan: "free",
          isActive: true,
        },
        include: {
          cartCheckoutSettings: true,
        },
      });
    }

    const formData = await request.formData();

    // Build update data
    const updateData: any = {};

    // Cart settings
    if (formData.has("cartEnabled"))
      updateData.cartEnabled = formData.get("cartEnabled") === "true";
    if (formData.has("cartPosition"))
      updateData.cartPosition = formData.get("cartPosition");
    if (formData.has("cartStyle"))
      updateData.cartStyle = formData.get("cartStyle");
    if (formData.has("cartAggregation"))
      updateData.cartAggregation = formData.get("cartAggregation");

    // Checkout settings
    if (formData.has("checkoutEnabled"))
      updateData.checkoutEnabled = formData.get("checkoutEnabled") === "true";
    if (formData.has("checkoutPosition"))
      updateData.checkoutPosition = formData.get("checkoutPosition");
    if (formData.has("checkoutStyle"))
      updateData.checkoutStyle = formData.get("checkoutStyle");

    let settings;

    if (store.cartCheckoutSettings) {
      // Update existing settings
      settings = await db.cartCheckoutSettings.update({
        where: { storeId: store.id },
        data: updateData,
      });
    } else {
      // Create new settings
      settings = await db.cartCheckoutSettings.create({
        data: {
          storeId: store.id,
          cartEnabled: updateData.cartEnabled ?? true,
          cartPosition: updateData.cartPosition ?? "under_product_title",
          cartStyle: updateData.cartStyle ?? "info",
          cartAggregation: updateData.cartAggregation ?? "latest",
          checkoutEnabled: updateData.checkoutEnabled ?? true,
          checkoutPosition: updateData.checkoutPosition ?? "order_summary_section",
          checkoutStyle: updateData.checkoutStyle ?? "success",
        },
      });
    }

    return json({
      success: true,
      settings,
      message: "Cart & Checkout settings saved successfully",
    });
  } catch (error) {
    console.error("Error saving cart-checkout settings:", error);
    return json(
      {
        success: false,
        error: "Failed to save cart-checkout settings",
      },
      { status: 500 }
    );
  }
}
