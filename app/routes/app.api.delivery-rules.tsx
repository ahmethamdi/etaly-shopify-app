import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// GET - List all delivery rules
export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    // Get or create store
    let store = await db.store.findUnique({
      where: { shop },
      include: {
        deliveryRules: {
          orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!store) {
      // Create store if it doesn't exist
      store = await db.store.create({
        data: {
          shop,
          plan: "free",
          isActive: true,
        },
        include: {
          deliveryRules: true,
        },
      });
    }

    return json({
      success: true,
      rules: store.deliveryRules,
    });
  } catch (error) {
    console.error("Error fetching delivery rules:", error);
    return json(
      {
        success: false,
        error: "Failed to fetch delivery rules",
      },
      { status: 500 }
    );
  }
}

// POST - Create, Update, or Delete delivery rule
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
    const action = formData.get("action") as string;

    // CREATE
    if (action === "create") {
      const name = formData.get("name") as string;
      const countries = formData.get("countries") as string;
      const minDays = parseInt(formData.get("minDays") as string);
      const maxDays = parseInt(formData.get("maxDays") as string);

      const rule = await db.deliveryRule.create({
        data: {
          storeId: store.id,
          name,
          countries,
          minDays,
          maxDays,
          isActive: formData.get("isActive") === "true",
          priority: parseInt(formData.get("priority") as string) || 0,
          carrier: formData.get("carrier") as string,
          shippingMethod: formData.get("shippingMethod") as string,
          cutoffTime: formData.get("cutoffTime") as string,
          cutoffTimezone: (formData.get("cutoffTimezone") as string) || "UTC",
          processingDays: parseInt(formData.get("processingDays") as string) || 0,
          excludeWeekends: formData.get("excludeWeekends") === "true",
          excludeHolidays: formData.get("excludeHolidays") === "true",
          regions: formData.get("regions") as string,
          postalCodes: formData.get("postalCodes") as string,
          messageTemplate: formData.get("messageTemplate") as string,
          messageIcon: formData.get("messageIcon") as string,
          messageColor: formData.get("messageColor") as string,
          messageBgColor: formData.get("messageBgColor") as string,
        },
      });

      return json({
        success: true,
        rule,
        message: "Delivery rule created successfully",
      });
    }

    // UPDATE
    if (action === "update") {
      const id = formData.get("id") as string;

      const updateData: any = {};

      if (formData.has("name")) updateData.name = formData.get("name");
      if (formData.has("countries")) updateData.countries = formData.get("countries");
      if (formData.has("minDays")) updateData.minDays = parseInt(formData.get("minDays") as string);
      if (formData.has("maxDays")) updateData.maxDays = parseInt(formData.get("maxDays") as string);
      if (formData.has("isActive")) updateData.isActive = formData.get("isActive") === "true";
      if (formData.has("priority")) updateData.priority = parseInt(formData.get("priority") as string);
      if (formData.has("carrier")) updateData.carrier = formData.get("carrier");
      if (formData.has("shippingMethod")) updateData.shippingMethod = formData.get("shippingMethod");
      if (formData.has("cutoffTime")) updateData.cutoffTime = formData.get("cutoffTime");
      if (formData.has("cutoffTimezone")) updateData.cutoffTimezone = formData.get("cutoffTimezone");
      if (formData.has("processingDays")) updateData.processingDays = parseInt(formData.get("processingDays") as string);
      if (formData.has("excludeWeekends")) updateData.excludeWeekends = formData.get("excludeWeekends") === "true";
      if (formData.has("excludeHolidays")) updateData.excludeHolidays = formData.get("excludeHolidays") === "true";
      if (formData.has("regions")) updateData.regions = formData.get("regions");
      if (formData.has("postalCodes")) updateData.postalCodes = formData.get("postalCodes");
      if (formData.has("messageTemplate")) updateData.messageTemplate = formData.get("messageTemplate");
      if (formData.has("messageIcon")) updateData.messageIcon = formData.get("messageIcon");
      if (formData.has("messageColor")) updateData.messageColor = formData.get("messageColor");
      if (formData.has("messageBgColor")) updateData.messageBgColor = formData.get("messageBgColor");

      const rule = await db.deliveryRule.update({
        where: { id },
        data: updateData,
      });

      return json({
        success: true,
        rule,
        message: "Delivery rule updated successfully",
      });
    }

    // DELETE
    if (action === "delete") {
      const id = formData.get("id") as string;

      await db.deliveryRule.delete({
        where: { id },
      });

      return json({
        success: true,
        message: "Delivery rule deleted successfully",
      });
    }

    // TOGGLE ACTIVE
    if (action === "toggle") {
      const id = formData.get("id") as string;

      const rule = await db.deliveryRule.findUnique({
        where: { id },
      });

      if (!rule) {
        return json(
          {
            success: false,
            error: "Rule not found",
          },
          { status: 404 }
        );
      }

      const updatedRule = await db.deliveryRule.update({
        where: { id },
        data: { isActive: !rule.isActive },
      });

      return json({
        success: true,
        rule: updatedRule,
        message: "Rule status toggled successfully",
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
    console.error("Error processing delivery rule action:", error);
    return json(
      {
        success: false,
        error: "Failed to process delivery rule action",
      },
      { status: 500 }
    );
  }
}
