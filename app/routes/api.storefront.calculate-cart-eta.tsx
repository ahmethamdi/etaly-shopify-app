import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "../db.server";

/**
 * Storefront API: Calculate Cart ETA
 * Calculates delivery estimate for entire cart
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { items, countryCode, aggregation = "latest" } = body;

    if (!items || items.length === 0) {
      return json({
        success: false,
        error: "No items in cart",
      });
    }

    // Get shop from request headers
    const shop = request.headers.get("host")?.replace(/:\d+$/, "") || "";

    // Find store by shop domain
    const store = await db.store.findFirst({
      where: {
        shop: {
          contains: shop.split(".")[0],
        },
        appEnabled: true,
      },
      include: {
        deliveryRules: {
          where: {
            isActive: true,
          },
          orderBy: {
            priority: "desc",
          },
        },
        settings: true,
        cartCheckoutSettings: true,
      },
    });

    if (!store || !store.cartCheckoutSettings?.cartEnabled) {
      return json({
        success: false,
        error: "Cart ETA not enabled",
      });
    }

    // Calculate ETA for each item
    const itemETAs = [];

    for (const item of items) {
      const eta = await calculateItemETA(
        item.productId,
        item.variantId,
        countryCode,
        store
      );
      if (eta) {
        itemETAs.push({
          ...eta,
          quantity: item.quantity,
        });
      }
    }

    if (itemETAs.length === 0) {
      return json({
        success: false,
        error: "No delivery rules matched",
      });
    }

    // Aggregate ETAs based on settings
    const aggregatedETA = aggregateETAs(itemETAs, aggregation);

    return json({
      success: true,
      eta: aggregatedETA,
    });
  } catch (error) {
    console.error("[ETAly] Cart ETA calculation error:", error);
    return json(
      {
        success: false,
        error: "Failed to calculate delivery estimate",
      },
      { status: 500 }
    );
  }
};

async function calculateItemETA(
  productId: string,
  variantId: string,
  countryCode: string,
  store: any
) {
  // Find matching delivery rule
  const matchingRule = store.deliveryRules.find((rule: any) => {
    const countries = JSON.parse(rule.countries || "[]");
    return countries.includes(countryCode);
  });

  if (!matchingRule) {
    return null;
  }

  // Calculate delivery date
  const now = new Date();
  const deliveryDate = calculateDeliveryDate(
    now,
    matchingRule.minDays,
    matchingRule.maxDays,
    matchingRule.processingDays,
    matchingRule.excludeWeekends,
    matchingRule.excludeHolidays,
    matchingRule.cutoffTime
  );

  return {
    minDate: deliveryDate.minDate,
    maxDate: deliveryDate.maxDate,
    message: formatETAMessage(deliveryDate, matchingRule),
    ruleId: matchingRule.id,
  };
}

function calculateDeliveryDate(
  startDate: Date,
  minDays: number,
  maxDays: number,
  processingDays: number,
  excludeWeekends: boolean,
  excludeHolidays: boolean,
  cutoffTime?: string | null
) {
  let currentDate = new Date(startDate);

  // Check cutoff time
  if (cutoffTime) {
    const [hours, minutes] = cutoffTime.split(":").map(Number);
    const cutoff = new Date(currentDate);
    cutoff.setHours(hours, minutes, 0, 0);

    if (currentDate > cutoff) {
      // Past cutoff, start from tomorrow
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // Add processing days
  currentDate = addBusinessDays(currentDate, processingDays, excludeWeekends);

  // Calculate min and max delivery dates
  const minDate = addBusinessDays(
    new Date(currentDate),
    minDays,
    excludeWeekends
  );
  const maxDate = addBusinessDays(
    new Date(currentDate),
    maxDays,
    excludeWeekends
  );

  return { minDate, maxDate };
}

function addBusinessDays(
  date: Date,
  days: number,
  excludeWeekends: boolean
): Date {
  const result = new Date(date);
  let addedDays = 0;

  while (addedDays < days) {
    result.setDate(result.getDate() + 1);

    if (excludeWeekends) {
      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        addedDays++;
      }
    } else {
      addedDays++;
    }
  }

  return result;
}

function formatETAMessage(deliveryDate: any, rule: any): string {
  const minDateStr = deliveryDate.minDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const maxDateStr = deliveryDate.maxDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (rule.messageTemplate) {
    return rule.messageTemplate
      .replace("{eta_min}", minDateStr)
      .replace("{eta_max}", maxDateStr);
  }

  return `Estimated delivery: ${minDateStr} - ${maxDateStr}`;
}

function aggregateETAs(itemETAs: any[], aggregation: string) {
  if (aggregation === "latest") {
    // Show the latest (longest) delivery date
    const latest = itemETAs.reduce((max, item) =>
      item.maxDate > max.maxDate ? item : max
    );
    return latest;
  } else {
    // Show the earliest (shortest) delivery date
    const earliest = itemETAs.reduce((min, item) =>
      item.minDate < min.minDate ? item : min
    );
    return earliest;
  }
}
