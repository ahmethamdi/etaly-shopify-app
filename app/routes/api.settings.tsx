import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// GET - Load settings
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { session } = await authenticate.admin(request);

    const store = await db.store.findUnique({
      where: { shop: session.shop },
      include: { settings: true },
    });

    if (!store) {
      return json({ error: "Store not found" }, { status: 404 });
    }

    // If settings don't exist, create default settings
    if (!store.settings) {
      const defaultSettings = await db.settings.create({
        data: {
          storeId: store.id,
          defaultLanguage: "en",
          dateFormat: "DD/MM/YYYY",
          timeFormat: "24",
          debugMode: false,
        },
      });

      return json({
        appEnabled: store.appEnabled,
        defaultLanguage: defaultSettings.defaultLanguage,
        dateFormat: defaultSettings.dateFormat,
        timeFormat: defaultSettings.timeFormat,
        customCss: defaultSettings.customCSS || "",
        debugMode: defaultSettings.debugMode,
      });
    }

    return json({
      appEnabled: store.appEnabled,
      defaultLanguage: store.settings.defaultLanguage,
      dateFormat: store.settings.dateFormat,
      timeFormat: store.settings.timeFormat,
      customCss: store.settings.customCSS || "",
      debugMode: store.settings.debugMode,
    });
  } catch (error) {
    console.error("Settings load error:", error);
    return json({ error: "Failed to load settings" }, { status: 500 });
  }
}

// POST - Save settings
export async function action({ request }: ActionFunctionArgs) {
  try {
    const { session } = await authenticate.admin(request);

    const formData = await request.formData();
    const appEnabled = formData.get("appEnabled") === "true";
    const defaultLanguage = formData.get("defaultLanguage") as string;
    const dateFormat = formData.get("dateFormat") as string;
    const timeFormat = formData.get("timeFormat") as string;
    const customCss = formData.get("customCss") as string;
    const debugMode = formData.get("debugMode") === "true";

    const store = await db.store.findUnique({
      where: { shop: session.shop },
      include: { settings: true },
    });

    if (!store) {
      return json({ error: "Store not found" }, { status: 404 });
    }

    // Update store appEnabled
    await db.store.update({
      where: { id: store.id },
      data: { appEnabled },
    });

    // Upsert settings
    await db.settings.upsert({
      where: { storeId: store.id },
      create: {
        storeId: store.id,
        defaultLanguage,
        dateFormat,
        timeFormat,
        customCSS: customCss,
        debugMode,
      },
      update: {
        defaultLanguage,
        dateFormat,
        timeFormat,
        customCSS: customCss,
        debugMode,
      },
    });

    return json({ success: true });
  } catch (error) {
    console.error("Settings save error:", error);
    return json({ error: "Failed to save settings" }, { status: 500 });
  }
}
