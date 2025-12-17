import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// GET - Fetch store settings
export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    // Get or create store
    let store = await db.store.findUnique({
      where: { shop },
      include: { settings: true },
    });

    if (!store) {
      store = await db.store.create({
        data: {
          shop,
          plan: "free",
          isActive: true,
          settings: {
            create: {
              defaultLanguage: "en",
              dateFormat: "DD/MM/YYYY",
              timeFormat: "24",
              debugMode: false,
              targetingMode: "all",
            },
          },
        },
        include: { settings: true },
      });
    }

    // Create settings if not exist
    if (!store.settings) {
      await db.settings.create({
        data: {
          storeId: store.id,
          defaultLanguage: "en",
          dateFormat: "DD/MM/YYYY",
          timeFormat: "24",
          debugMode: false,
          targetingMode: "all",
        },
      });

      store = await db.store.findUnique({
        where: { shop },
        include: { settings: true },
      });
    }

    return json({
      success: true,
      settings: store?.settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return json(
      {
        success: false,
        error: "Failed to fetch settings",
      },
      { status: 500 }
    );
  }
}

// POST - Update settings
export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    // Get or create store
    let store = await db.store.findUnique({
      where: { shop },
      include: { settings: true },
    });

    if (!store) {
      store = await db.store.create({
        data: {
          shop,
          plan: "free",
          isActive: true,
        },
        include: { settings: true },
      });
    }

    const formData = await request.formData();

    const updateData: any = {};

    if (formData.has("defaultLanguage"))
      updateData.defaultLanguage = formData.get("defaultLanguage");
    if (formData.has("dateFormat"))
      updateData.dateFormat = formData.get("dateFormat");
    if (formData.has("timeFormat"))
      updateData.timeFormat = formData.get("timeFormat");
    if (formData.has("customCSS"))
      updateData.customCSS = formData.get("customCSS");
    if (formData.has("debugMode"))
      updateData.debugMode = formData.get("debugMode") === "true";
    if (formData.has("targetingMode"))
      updateData.targetingMode = formData.get("targetingMode");
    if (formData.has("targetTags"))
      updateData.targetTags = formData.get("targetTags");
    if (formData.has("excludedProducts"))
      updateData.excludedProducts = formData.get("excludedProducts");

    // Update or create settings
    let settings;
    if (store.settings) {
      settings = await db.settings.update({
        where: { storeId: store.id },
        data: updateData,
      });
    } else {
      settings = await db.settings.create({
        data: {
          storeId: store.id,
          ...updateData,
        },
      });
    }

    return json({
      success: true,
      settings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return json(
      {
        success: false,
        error: "Failed to update settings",
      },
      { status: 500 }
    );
  }
}
