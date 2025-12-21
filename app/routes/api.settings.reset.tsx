import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { session } = await authenticate.admin(request);

    const store = await db.store.findUnique({
      where: { shop: session.shop },
    });

    if (!store) {
      return json({ error: "Store not found" }, { status: 404 });
    }

    // Delete all delivery rules
    await db.deliveryRule.deleteMany({
      where: { storeId: store.id },
    });

    // Delete all holidays
    await db.holiday.deleteMany({
      where: { storeId: store.id },
    });

    // Delete all custom message templates (keep built-in ones)
    await db.messageTemplate.deleteMany({
      where: {
        storeId: store.id,
        isBuiltIn: false,
      },
    });

    // Delete cart/checkout settings
    await db.cartCheckoutSettings.deleteMany({
      where: { storeId: store.id },
    });

    // Reset settings to defaults
    await db.settings.upsert({
      where: { storeId: store.id },
      create: {
        storeId: store.id,
        defaultLanguage: "en",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24",
        customCSS: null,
        debugMode: false,
        targetingMode: "all",
        targetTags: null,
        excludedProducts: null,
      },
      update: {
        defaultLanguage: "en",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24",
        customCSS: null,
        debugMode: false,
        targetingMode: "all",
        targetTags: null,
        excludedProducts: null,
      },
    });

    // Reset store settings
    await db.store.update({
      where: { id: store.id },
      data: {
        appEnabled: true,
        excludeWeekends: true,
        skipHolidays: true,
        activeTemplateId: null,
      },
    });

    // Note: We don't delete analytics or reset the plan
    // Analytics is historical data
    // Plan should not be reset as it's tied to billing

    return json({ success: true, message: "All settings have been reset to defaults" });
  } catch (error) {
    console.error("Reset settings error:", error);
    return json({ error: "Failed to reset settings" }, { status: 500 });
  }
}
