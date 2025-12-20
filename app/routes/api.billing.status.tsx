import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { session, admin } = await authenticate.admin(request);

    // Get store
    const store = await db.store.findUnique({
      where: { shop: session.shop },
    });

    if (!store) {
      return json({ error: "Store not found" }, { status: 404 });
    }

    // Get active subscription from Shopify
    const response = await admin.graphql(
      `#graphql
      query {
        app {
          installation {
            activeSubscriptions {
              id
              name
              status
              test
              trialDays
              currentPeriodEnd
            }
          }
        }
      }`
    );

    const data = await response.json();
    const subscriptions = data?.data?.app?.installation?.activeSubscriptions || [];
    const activeSubscription = subscriptions[0];

    // Determine current plan
    let currentPlan = store.plan || "free";
    let status = "inactive";
    let renewalDate = null;

    if (activeSubscription) {
      status = activeSubscription.status.toLowerCase();
      renewalDate = activeSubscription.currentPeriodEnd;

      // Determine plan from subscription name
      if (activeSubscription.name.toLowerCase().includes("pro")) {
        currentPlan = "pro";
      } else if (activeSubscription.name.toLowerCase().includes("advanced")) {
        currentPlan = "advanced";
      }
    }

    return json({
      currentPlan,
      status,
      renewalDate,
      paymentLast4: null, // Shopify doesn't expose payment details
      billingEmail: session.shop, // Using shop domain as email proxy
      urls: {
        manage: `https://${session.shop}/admin/settings/billing`,
        invoices: `https://${session.shop}/admin/settings/billing`,
      },
    });
  } catch (error) {
    console.error("Billing status error:", error);
    return json({ error: "Failed to fetch billing status" }, { status: 500 });
  }
}
