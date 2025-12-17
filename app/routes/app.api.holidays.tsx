import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// GET - List all holidays
export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    // Get or create store
    let store = await db.store.findUnique({
      where: { shop },
      include: {
        holidays: {
          orderBy: { date: "asc" },
        },
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
          holidays: true,
        },
      });
    }

    return json({
      success: true,
      holidays: store.holidays,
    });
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return json(
      {
        success: false,
        error: "Failed to fetch holidays",
      },
      { status: 500 }
    );
  }
}

// POST - Create, Update, or Delete holiday
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
      const date = new Date(formData.get("date") as string);
      const countryCode = formData.get("countryCode") as string | null;
      const isRecurring = formData.get("isRecurring") === "true";

      const holiday = await db.holiday.create({
        data: {
          storeId: store.id,
          name,
          date,
          countryCode,
          isRecurring,
        },
      });

      return json({
        success: true,
        holiday,
        message: "Holiday created successfully",
      });
    }

    // UPDATE
    if (action === "update") {
      const id = formData.get("id") as string;

      const updateData: any = {};

      if (formData.has("name")) updateData.name = formData.get("name");
      if (formData.has("date"))
        updateData.date = new Date(formData.get("date") as string);
      if (formData.has("countryCode"))
        updateData.countryCode = formData.get("countryCode");
      if (formData.has("isRecurring"))
        updateData.isRecurring = formData.get("isRecurring") === "true";

      const holiday = await db.holiday.update({
        where: { id },
        data: updateData,
      });

      return json({
        success: true,
        holiday,
        message: "Holiday updated successfully",
      });
    }

    // DELETE
    if (action === "delete") {
      const id = formData.get("id") as string;

      await db.holiday.delete({
        where: { id },
      });

      return json({
        success: true,
        message: "Holiday deleted successfully",
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
    console.error("Error processing holiday action:", error);
    return json(
      {
        success: false,
        error: "Failed to process holiday action",
      },
      { status: 500 }
    );
  }
}
