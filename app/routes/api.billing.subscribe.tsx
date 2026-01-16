import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { session, admin } = await authenticate.admin(request);

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
                  price: { amount: selectedPlan.amount, currencyCode: "USD" },
                  interval: "EVERY_30_DAYS",
                },
              },
            },
          ],
          returnUrl: `https://${session.shop}/admin/apps/etaly/plans-billing?upgraded=${plan}`,
          trialDays: selectedPlan.trialDays,
          test: process.env.NODE_ENV !== "production",
        },
      }
    );

    const responseJson = await response.json();

    // Check for GraphQL errors
    if (responseJson.errors && responseJson.errors.length > 0) {
      console.error("GraphQL errors:", responseJson.errors);
      return json({
        error: responseJson.errors[0].message || "GraphQL error occurred"
      }, { status: 400 });
    }

    const result = responseJson?.data?.appSubscriptionCreate;

    // Check for user errors
    if (result?.userErrors?.length > 0) {
      console.error("User errors:", result.userErrors);
      return json({
        error: result.userErrors[0].message || "Subscription error"
      }, { status: 400 });
    }

    // Check if we got a confirmation URL
    if (!result?.confirmationUrl) {
      console.error("No confirmation URL returned:", responseJson);
      return json({
        error: "Failed to get confirmation URL"
      }, { status: 500 });
    }

    // Return confirmation URL - database will be updated after merchant confirms
    return json({ confirmationUrl: result.confirmationUrl });

  } catch (error) {
    console.error("Billing subscription error:", error);
    return json({
      error: error instanceof Error ? error.message : "Failed to create subscription"
    }, { status: 500 });
  }
}
