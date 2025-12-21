import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { session } = await authenticate.admin(request);

    const formData = await request.formData();
    const jsonFile = formData.get("file") as File;

    if (!jsonFile) {
      return json({ error: "No file provided" }, { status: 400 });
    }

    // Read and parse JSON
    const jsonText = await jsonFile.text();
    let importData: any;

    try {
      importData = JSON.parse(jsonText);
    } catch (error) {
      return json({ error: "Invalid JSON file" }, { status: 400 });
    }

    // Validate structure
    if (!importData.version || !importData.store) {
      return json({ error: "Invalid ETAly export file" }, { status: 400 });
    }

    const store = await db.store.findUnique({
      where: { shop: session.shop },
    });

    if (!store) {
      return json({ error: "Store not found" }, { status: 404 });
    }

    // Update store settings
    await db.store.update({
      where: { id: store.id },
      data: {
        appEnabled: importData.store.appEnabled ?? true,
        excludeWeekends: importData.store.excludeWeekends ?? true,
        skipHolidays: importData.store.skipHolidays ?? true,
        activeTemplateId: importData.store.activeTemplateId,
      },
    });

    // Update/create settings
    if (importData.settings) {
      await db.settings.upsert({
        where: { storeId: store.id },
        create: {
          storeId: store.id,
          defaultLanguage: importData.settings.defaultLanguage || "en",
          dateFormat: importData.settings.dateFormat || "DD/MM/YYYY",
          timeFormat: importData.settings.timeFormat || "24",
          customCSS: importData.settings.customCSS,
          debugMode: importData.settings.debugMode || false,
          targetingMode: importData.settings.targetingMode || "all",
          targetTags: importData.settings.targetTags,
          excludedProducts: importData.settings.excludedProducts,
        },
        update: {
          defaultLanguage: importData.settings.defaultLanguage || "en",
          dateFormat: importData.settings.dateFormat || "DD/MM/YYYY",
          timeFormat: importData.settings.timeFormat || "24",
          customCSS: importData.settings.customCSS,
          debugMode: importData.settings.debugMode || false,
          targetingMode: importData.settings.targetingMode || "all",
          targetTags: importData.settings.targetTags,
          excludedProducts: importData.settings.excludedProducts,
        },
      });
    }

    // Delete existing delivery rules and import new ones
    if (importData.deliveryRules && Array.isArray(importData.deliveryRules)) {
      await db.deliveryRule.deleteMany({
        where: { storeId: store.id },
      });

      for (const rule of importData.deliveryRules) {
        await db.deliveryRule.create({
          data: {
            storeId: store.id,
            name: rule.name,
            isActive: rule.isActive ?? true,
            priority: rule.priority ?? 0,
            countries: rule.countries,
            regions: rule.regions,
            postalCodes: rule.postalCodes,
            carrier: rule.carrier,
            shippingMethod: rule.shippingMethod,
            cutoffTime: rule.cutoffTime,
            cutoffTimezone: rule.cutoffTimezone || "UTC",
            minDays: rule.minDays ?? 2,
            maxDays: rule.maxDays ?? 5,
            processingDays: rule.processingDays ?? 0,
            excludeWeekends: rule.excludeWeekends ?? true,
            excludeHolidays: rule.excludeHolidays ?? true,
            messageTemplate: rule.messageTemplate,
            messageIcon: rule.messageIcon,
            messageColor: rule.messageColor,
            messageBgColor: rule.messageBgColor,
          },
        });
      }
    }

    // Delete existing holidays and import new ones
    if (importData.holidays && Array.isArray(importData.holidays)) {
      await db.holiday.deleteMany({
        where: { storeId: store.id },
      });

      for (const holiday of importData.holidays) {
        await db.holiday.create({
          data: {
            storeId: store.id,
            name: holiday.name,
            date: new Date(holiday.date),
            countryCode: holiday.countryCode,
            isRecurring: holiday.isRecurring ?? false,
          },
        });
      }
    }

    // Update cart/checkout settings
    if (importData.cartCheckoutSettings) {
      await db.cartCheckoutSettings.upsert({
        where: { storeId: store.id },
        create: {
          storeId: store.id,
          cartEnabled: importData.cartCheckoutSettings.cartEnabled ?? true,
          cartPosition: importData.cartCheckoutSettings.cartPosition || "under_product_title",
          cartStyle: importData.cartCheckoutSettings.cartStyle || "info",
          cartAggregation: importData.cartCheckoutSettings.cartAggregation || "latest",
          checkoutEnabled: importData.cartCheckoutSettings.checkoutEnabled ?? true,
          checkoutPosition: importData.cartCheckoutSettings.checkoutPosition || "order_summary_section",
          checkoutStyle: importData.cartCheckoutSettings.checkoutStyle || "success",
        },
        update: {
          cartEnabled: importData.cartCheckoutSettings.cartEnabled ?? true,
          cartPosition: importData.cartCheckoutSettings.cartPosition || "under_product_title",
          cartStyle: importData.cartCheckoutSettings.cartStyle || "info",
          cartAggregation: importData.cartCheckoutSettings.cartAggregation || "latest",
          checkoutEnabled: importData.cartCheckoutSettings.checkoutEnabled ?? true,
          checkoutPosition: importData.cartCheckoutSettings.checkoutPosition || "order_summary_section",
          checkoutStyle: importData.cartCheckoutSettings.checkoutStyle || "success",
        },
      });
    }

    // Import custom templates (only non-built-in ones)
    if (importData.messageTemplates && Array.isArray(importData.messageTemplates)) {
      // Delete existing custom templates
      await db.messageTemplate.deleteMany({
        where: {
          storeId: store.id,
          isBuiltIn: false,
        },
      });

      for (const template of importData.messageTemplates) {
        await db.messageTemplate.create({
          data: {
            storeId: store.id,
            templateId: template.templateId,
            name: template.name,
            description: template.description,
            icon: template.icon,
            message: template.message,
            toneDefault: template.toneDefault || "info",
            isPro: template.isPro ?? false,
            isBuiltIn: false,
            supportsCountdown: template.supportsCountdown ?? false,
            placements: template.placements || "product,cart,checkout",
          },
        });
      }
    }

    return json({ success: true, message: "Settings imported successfully" });
  } catch (error) {
    console.error("Import settings error:", error);
    return json({ error: "Failed to import settings" }, { status: 500 });
  }
}
