import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { session } = await authenticate.admin(request);

    const store = await db.store.findUnique({
      where: { shop: session.shop },
      include: {
        settings: true,
        deliveryRules: true,
        holidays: true,
        cartCheckoutSettings: true,
        messageTemplates: true,
      },
    });

    if (!store) {
      return json({ error: "Store not found" }, { status: 404 });
    }

    // Build export data
    const exportData = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      store: {
        appEnabled: store.appEnabled,
        excludeWeekends: store.excludeWeekends,
        skipHolidays: store.skipHolidays,
        activeTemplateId: store.activeTemplateId,
      },
      settings: store.settings ? {
        defaultLanguage: store.settings.defaultLanguage,
        dateFormat: store.settings.dateFormat,
        timeFormat: store.settings.timeFormat,
        customCSS: store.settings.customCSS,
        debugMode: store.settings.debugMode,
        targetingMode: store.settings.targetingMode,
        targetTags: store.settings.targetTags,
        excludedProducts: store.settings.excludedProducts,
      } : null,
      deliveryRules: store.deliveryRules.map((rule) => ({
        name: rule.name,
        isActive: rule.isActive,
        priority: rule.priority,
        countries: rule.countries,
        regions: rule.regions,
        postalCodes: rule.postalCodes,
        carrier: rule.carrier,
        shippingMethod: rule.shippingMethod,
        cutoffTime: rule.cutoffTime,
        cutoffTimezone: rule.cutoffTimezone,
        minDays: rule.minDays,
        maxDays: rule.maxDays,
        processingDays: rule.processingDays,
        excludeWeekends: rule.excludeWeekends,
        excludeHolidays: rule.excludeHolidays,
        messageTemplate: rule.messageTemplate,
        messageIcon: rule.messageIcon,
        messageColor: rule.messageColor,
        messageBgColor: rule.messageBgColor,
      })),
      holidays: store.holidays.map((holiday) => ({
        name: holiday.name,
        date: holiday.date.toISOString(),
        countryCode: holiday.countryCode,
        isRecurring: holiday.isRecurring,
      })),
      cartCheckoutSettings: store.cartCheckoutSettings ? {
        cartEnabled: store.cartCheckoutSettings.cartEnabled,
        cartPosition: store.cartCheckoutSettings.cartPosition,
        cartStyle: store.cartCheckoutSettings.cartStyle,
        cartAggregation: store.cartCheckoutSettings.cartAggregation,
        checkoutEnabled: store.cartCheckoutSettings.checkoutEnabled,
        checkoutPosition: store.cartCheckoutSettings.checkoutPosition,
        checkoutStyle: store.cartCheckoutSettings.checkoutStyle,
      } : null,
      messageTemplates: store.messageTemplates
        .filter((t) => !t.isBuiltIn) // Only export custom templates
        .map((template) => ({
          templateId: template.templateId,
          name: template.name,
          description: template.description,
          icon: template.icon,
          message: template.message,
          toneDefault: template.toneDefault,
          isPro: template.isPro,
          supportsCountdown: template.supportsCountdown,
          placements: template.placements,
        })),
    };

    // Return as JSON download
    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="etaly-settings-${session.shop}-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Export settings error:", error);
    return json({ error: "Failed to export settings" }, { status: 500 });
  }
}
