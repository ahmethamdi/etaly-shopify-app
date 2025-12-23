import db from "../db.server";

interface CalculateETAParams {
  storeId: string;
  countryCode: string;
  postalCode?: string;
  productId?: string;
  variantId?: string;
  orderDate?: Date;
}

interface ETAResult {
  minDate: Date;
  maxDate: Date;
  minDays: number;
  maxDays: number;
  message: string;
  ruleId?: string;
  ruleName?: string;
  tone?: string;
}

export class ETACalculator {
  /**
   * Calculate ETA for a given order
   */
  static async calculate(params: CalculateETAParams): Promise<ETAResult | null> {
    const {
      storeId,
      countryCode,
      postalCode,
      productId,
      variantId,
      orderDate = new Date(),
    } = params;

    // Find applicable delivery rules
    const rules = await db.deliveryRule.findMany({
      where: {
        storeId,
        isActive: true,
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    // Find matching rule
    let matchedRule = null;
    for (const rule of rules) {
      const countries = JSON.parse(rule.countries);

      if (countries.includes(countryCode) || countries.includes("*")) {
        // Check postal code if specified
        if (rule.postalCodes && postalCode) {
          const postalCodes = JSON.parse(rule.postalCodes);
          if (!postalCodes.includes(postalCode)) {
            continue;
          }
        }

        matchedRule = rule;
        break;
      }
    }

    if (!matchedRule) {
      return null;
    }

    // Check for product-specific delivery days override
    let minDays = matchedRule.minDays;
    let maxDays = matchedRule.maxDays;
    let processingDays = matchedRule.processingDays;

    if (productId) {
      const productTargeting = await db.productTargeting.findFirst({
        where: {
          storeId,
          ruleId: matchedRule.id,
          productId,
          OR: [
            { variantId: variantId || null },
            { variantId: null },
          ],
        },
        orderBy: [
          { variantId: "desc" }, // Prioritize variant-specific over product-wide
        ],
      });

      if (productTargeting) {
        // Override with product-specific days if set
        if (productTargeting.overrideMinDays !== null) {
          minDays = productTargeting.overrideMinDays;
        }
        if (productTargeting.overrideMaxDays !== null) {
          maxDays = productTargeting.overrideMaxDays;
        }
        if (productTargeting.overrideProcessingDays !== null) {
          processingDays = productTargeting.overrideProcessingDays;
        }
      }
    }

    // Get settings
    const settings = await db.settings.findUnique({
      where: { storeId },
    });

    // Get store's active template
    const store = await db.store.findUnique({
      where: { id: storeId },
      include: {
        activeTemplate: true,
      },
    });

    // Calculate dates with potentially overridden values
    const result = await this.calculateDates({
      rule: { ...matchedRule, minDays, maxDays, processingDays },
      storeId,
      orderDate,
      excludeWeekends: matchedRule.excludeWeekends,
      excludeHolidays: matchedRule.excludeHolidays,
      activeTemplate: store?.activeTemplate || null,
    });

    return {
      ...result,
      ruleId: matchedRule.id,
      ruleName: matchedRule.name,
      tone: store?.activeTemplate?.toneDefault || "info", // Add tone for frontend styling
    };
  }

  /**
   * Calculate delivery dates considering weekends and holidays
   */
  private static async calculateDates(params: {
    rule: any;
    storeId: string;
    orderDate: Date;
    excludeWeekends: boolean;
    excludeHolidays: boolean;
    activeTemplate?: any;
  }): Promise<ETAResult> {
    const { rule, storeId, orderDate, excludeWeekends, excludeHolidays, activeTemplate } = params;

    // Get holidays if needed
    let holidays: Date[] = [];
    if (excludeHolidays) {
      const holidayRecords = await db.holiday.findMany({
        where: { storeId },
      });
      holidays = holidayRecords.map((h) => h.date);
    }

    // Calculate min and max delivery dates
    const minDate = this.addBusinessDays(
      orderDate,
      rule.processingDays + rule.minDays,
      excludeWeekends,
      holidays
    );

    const maxDate = this.addBusinessDays(
      orderDate,
      rule.processingDays + rule.maxDays,
      excludeWeekends,
      holidays
    );

    // Generate message using active template if available
    const message = this.generateMessage(rule, minDate, maxDate, activeTemplate);

    return {
      minDate,
      maxDate,
      minDays: rule.minDays,
      maxDays: rule.maxDays,
      message,
    };
  }

  /**
   * Add business days to a date
   */
  private static addBusinessDays(
    startDate: Date,
    days: number,
    excludeWeekends: boolean,
    holidays: Date[]
  ): Date {
    let currentDate = new Date(startDate);
    let addedDays = 0;

    while (addedDays < days) {
      currentDate.setDate(currentDate.getDate() + 1);

      // Check if weekend
      const isWeekend = excludeWeekends && (currentDate.getDay() === 0 || currentDate.getDay() === 6);

      // Check if holiday
      const isHoliday = holidays.some(
        (holiday) =>
          holiday.getDate() === currentDate.getDate() &&
          holiday.getMonth() === currentDate.getMonth() &&
          holiday.getFullYear() === currentDate.getFullYear()
      );

      // Only count if not weekend or holiday
      if (!isWeekend && !isHoliday) {
        addedDays++;
      }
    }

    return currentDate;
  }

  /**
   * Generate ETA message
   */
  private static generateMessage(rule: any, minDate: Date, maxDate: Date, activeTemplate?: any): string {
    // Use active template message if available
    if (activeTemplate?.message) {
      let message = activeTemplate.message
        .replace(/{eta_min_date}/g, this.formatDate(minDate))
        .replace(/{eta_max_date}/g, this.formatDate(maxDate))
        .replace(/{eta_date}/g, this.formatDate(maxDate)) // Single ETA date (uses max)
        .replace(/{eta_min}/g, rule.minDays.toString())
        .replace(/{eta_max}/g, rule.maxDays.toString())
        .replace(/{minDate}/g, this.formatDate(minDate))
        .replace(/{maxDate}/g, this.formatDate(maxDate))
        .replace(/{minDays}/g, rule.minDays.toString())
        .replace(/{maxDays}/g, rule.maxDays.toString());

      // Handle cutoff time variables
      if (rule.cutoffTime) {
        message = message.replace(/{cutoff_time}/g, rule.cutoffTime);

        // Calculate countdown to cutoff time (simplified - shows hours remaining today)
        const now = new Date();
        const [hours, minutes] = rule.cutoffTime.split(':').map(Number);
        const cutoff = new Date(now);
        cutoff.setHours(hours, minutes, 0, 0);

        if (cutoff > now) {
          const diff = cutoff.getTime() - now.getTime();
          const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
          const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          message = message.replace(/{countdown}/g, `${hoursLeft}h ${minutesLeft}m`);
        } else {
          message = message.replace(/{countdown}/g, 'tomorrow');
        }
      } else {
        // Fallback if no cutoff time set
        message = message.replace(/{cutoff_time}/g, '5:00 PM');
        message = message.replace(/{countdown}/g, '24 hours');
      }

      // Handle shipping method
      if (rule.shippingMethod) {
        message = message.replace(/{shipping_method}/g, rule.shippingMethod);
      } else {
        message = message.replace(/{shipping_method}/g, 'Express Shipping');
      }

      return message;
    }

    // Fallback to rule's custom template
    if (rule.messageTemplate) {
      return rule.messageTemplate
        .replace("{minDate}", this.formatDate(minDate))
        .replace("{maxDate}", this.formatDate(maxDate))
        .replace("{minDays}", rule.minDays.toString())
        .replace("{maxDays}", rule.maxDays.toString());
    }

    // Default message
    if (rule.minDays === rule.maxDays) {
      return `Delivery in ${rule.minDays} business day${rule.minDays > 1 ? "s" : ""}`;
    }

    return `Delivery in ${rule.minDays}-${rule.maxDays} business days`;
  }

  /**
   * Format date for display
   */
  private static formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }

  /**
   * Check if cutoff time has passed
   */
  static hasCutoffPassed(cutoffTime: string, timezone: string = "UTC"): boolean {
    const now = new Date();
    const [hours, minutes] = cutoffTime.split(":").map(Number);

    const cutoff = new Date();
    cutoff.setHours(hours, minutes, 0, 0);

    return now > cutoff;
  }
}

export default ETACalculator;
