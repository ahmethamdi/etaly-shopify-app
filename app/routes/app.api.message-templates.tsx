import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// GET - List all templates + user's active template
export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    // Get store with active template
    const store = await db.store.findUnique({
      where: { shop },
    });

    if (!store) {
      return json({
        success: false,
        error: "Store not found",
      }, { status: 404 });
    }

    // Get all built-in templates
    const templates = await db.messageTemplate.findMany({
      where: {
        OR: [
          { isBuiltIn: true, storeId: null }, // System templates
          { storeId: store.id }, // Custom templates for this store
        ],
      },
      orderBy: [
        { isPro: "asc" }, // Free first
        { createdAt: "asc" },
      ],
    });

    return json({
      success: true,
      templates,
      activeTemplateId: store.activeTemplateId,
      userPlan: store.plan,
    });
  } catch (error) {
    console.error("Error fetching message templates:", error);
    return json(
      {
        success: false,
        error: "Failed to fetch message templates",
      },
      { status: 500 }
    );
  }
}

// POST - Apply template or create custom template
export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    const formData = await request.formData();
    const action = formData.get("action") as string;

    // Get store
    let store = await db.store.findUnique({
      where: { shop },
    });

    if (!store) {
      return json({
        success: false,
        error: "Store not found",
      }, { status: 404 });
    }

    // APPLY TEMPLATE
    if (action === "apply") {
      const templateId = formData.get("templateId") as string;

      // Get the template
      const template = await db.messageTemplate.findUnique({
        where: { templateId },
      });

      if (!template) {
        return json({
          success: false,
          error: "Template not found",
        }, { status: 404 });
      }

      // Check if Pro template and user is on Free plan
      if (template.isPro && store.plan === "free") {
        return json({
          success: false,
          code: "UPGRADE_REQUIRED",
          error: "This template requires a Pro plan",
        }, { status: 403 });
      }

      // Apply template
      await db.store.update({
        where: { id: store.id },
        data: { activeTemplateId: templateId },
      });

      return json({
        success: true,
        message: "Template applied successfully",
        activeTemplateId: templateId,
      });
    }

    // CREATE CUSTOM TEMPLATE
    if (action === "create") {
      const name = formData.get("name") as string;
      const message = formData.get("message") as string;
      const description = formData.get("description") as string;
      const toneDefault = formData.get("toneDefault") as string;
      const placements = formData.get("placements") as string;

      // Generate unique templateId
      const templateId = `custom_${Date.now()}`;

      const template = await db.messageTemplate.create({
        data: {
          storeId: store.id,
          templateId,
          name,
          description,
          message,
          toneDefault: toneDefault || "info",
          placements: placements || "product,cart,checkout",
          isPro: false,
          isBuiltIn: false,
          supportsCountdown: message.includes("{countdown}"),
        },
      });

      return json({
        success: true,
        template,
        message: "Custom template created successfully",
      });
    }

    return json(
      {
        success: false,
        error: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing message template action:", error);
    return json(
      {
        success: false,
        error: "Failed to process template action",
      },
      { status: 500 }
    );
  }
}
