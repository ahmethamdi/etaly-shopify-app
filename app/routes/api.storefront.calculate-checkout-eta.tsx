import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "../db.server";

/**
 * Storefront API: Calculate Checkout ETA
 * Calculates delivery estimate for checkout page
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { items, countryCode, shippingAddress } = body;

    if (!items || items.length === 0) {
      return json({
        success: false,
        error: "No items in checkout",
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

    if (!store || !store.cartCheckoutSettings?.checkoutEnabled) {
      return json({
        success: false,
        error: "Checkout ETA not enabled",
      });
    }

    // Find best matching delivery rule
    const matchingRule = findMatchingRule(
      store.deliveryRules,
      countryCode,
      shippingAddress
    );

    if (!matchingRule) {
      return json({
        success: false,
        error: "No delivery rules matched",
      });
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

    const message = formatETAMessage(deliveryDate, matchingRule);

    return json({
      success: true,
      eta: {
        minDate: deliveryDate.minDate,
        maxDate: deliveryDate.maxDate,
        message,
        ruleId: matchingRule.id,
      },
    });
  } catch (error) {
    console.error("[ETAly] Checkout ETA calculation error:", error);
    return json(
      {
        success: false,
        error: "Failed to calculate delivery estimate",
      },
      { status: 500 }
    );
  }
};

function findMatchingRule(
  rules: any[],
  countryCode: string,
  shippingAddress?: any
) {
  // Sort by priority (highest first)
  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

  for (const rule of sortedRules) {
    const countries = JSON.parse(rule.countries || "[]");

    // Check country match
    if (!countries.includes(countryCode)) {
      continue;
    }

    // Check region/state match if specified
    if (rule.regions && shippingAddress?.province) {
      const regions = JSON.parse(rule.regions || "[]");
      if (regions.length > 0 && !regions.includes(shippingAddress.province)) {
        continue;
      }
    }

    // Check postal code match if specified
    if (rule.postalCodes && shippingAddress?.zip) {
      const postalCodes = JSON.parse(rule.postalCodes || "[]");
      if (
        postalCodes.length > 0 &&
        !postalCodes.includes(shippingAddress.zip)
      ) {
        continue;
      }
    }

    // Rule matched
    return rule;
  }

  // No rule matched, return first rule for country
  return sortedRules.find((rule) => {
    const countries = JSON.parse(rule.countries || "[]");
    return countries.includes(countryCode);
  });
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

  return `Your order will arrive ${minDateStr} - ${maxDateStr}`;
}
