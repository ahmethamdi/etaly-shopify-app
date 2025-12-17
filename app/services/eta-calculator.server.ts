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

    // Get settings
    const settings = await db.settings.findUnique({
      where: { storeId },
    });

    // Calculate dates
    const result = await this.calculateDates({
      rule: matchedRule,
      storeId,
      orderDate,
      excludeWeekends: matchedRule.excludeWeekends,
      excludeHolidays: matchedRule.excludeHolidays,
    });

    return {
      ...result,
      ruleId: matchedRule.id,
      ruleName: matchedRule.name,
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
  }): Promise<ETAResult> {
    const { rule, storeId, orderDate, excludeWeekends, excludeHolidays } = params;

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

    // Generate message
    const message = this.generateMessage(rule, minDate, maxDate);

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
  private static generateMessage(rule: any, minDate: Date, maxDate: Date): string {
    if (rule.messageTemplate) {
      // Use custom template
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
