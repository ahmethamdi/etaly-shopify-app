import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { session, admin, billing } = await authenticate.admin(request);

    const formData = await request.formData();
    const plan = formData.get("plan") as string;

    if (!plan || !["pro", "advanced"].includes(plan)) {
      return json({ error: "Invalid plan" }, { status: 400 });
    }

    // Get store
    const store = await db.store.findUnique({
      where: { shop: session.shop },
    });

    if (!store) {
      return json({ error: "Store not found" }, { status: 404 });
    }

    // Define plan details
    const planDetails = {
      pro: {
        name: "ETAly Pro Plan",
        amount: 19.99,
        trialDays: 14,
      },
      advanced: {
        name: "ETAly Advanced Plan",
        amount: 49.99,
        trialDays: 14,
      },
    };

    const selectedPlan = planDetails[plan as keyof typeof planDetails];

    // Create subscription using Shopify Billing API
    const billingCheck = await billing.require({
      plans: [selectedPlan.name],
      onFailure: async () => {
        // Create new subscription
        const response = await admin.graphql(
          `#graphql
          mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $trialDays: Int, $test: Boolean) {
            appSubscriptionCreate(
              name: $name
              lineItems: $lineItems
              returnUrl: $returnUrl
              trialDays: $trialDays
              test: $test
            ) {
              appSubscription {
                id
                status
              }
              confirmationUrl
              userErrors {
                field
                message
              }
            }
          }`,
          {
            variables: {
              name: selectedPlan.name,
              lineItems: [
                {
                  plan: {
                    appRecurringPricingDetails: {
                      price: { amount: selectedPlan.amount, currencyCode: "EUR" },
                      interval: "EVERY_30_DAYS",
                    },
                  },
                },
              ],
              returnUrl: `https://${session.shop}/admin/apps/etaly/plans-billing?plan=${plan}`,
              trialDays: selectedPlan.trialDays,
              test: process.env.NODE_ENV === "development",
            },
          }
        );

        const responseJson = await response.json();
        const result = responseJson?.data?.appSubscriptionCreate;

        if (result?.userErrors?.length > 0) {
          throw new Error(result.userErrors[0].message);
        }

        return { confirmationUrl: result?.confirmationUrl };
      },
    });

    // Update store plan in database
    await db.store.update({
      where: { id: store.id },
      data: { plan },
    });

    // Return confirmation URL
    if (billingCheck && typeof billingCheck === "object" && "confirmationUrl" in billingCheck) {
      return json({ confirmationUrl: billingCheck.confirmationUrl });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Billing subscription error:", error);
    return json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
