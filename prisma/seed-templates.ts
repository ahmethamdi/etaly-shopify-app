import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const builtInTemplates = [
  // Free templates
  {
    templateId: "order_today_tomorrow",
    name: "Order Today, Delivered Tomorrow",
    description: "Next day delivery promise",
    icon: "🚀",
    message: "Order now → arrives tomorrow by 6 PM",
    toneDefault: "success",
    isPro: false,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart,checkout",
  },
  {
    templateId: "standard_delivery_range",
    name: "Standard Delivery Range",
    description: "Standard day shipping",
    icon: "📦",
    message: "Delivery in {eta_min}-{eta_max} business days",
    toneDefault: "info",
    isPro: false,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart,checkout",
  },
  {
    templateId: "cutoff_time_warning",
    name: "Cutoff Time Warning",
    description: "Urgency-based countdown timer",
    icon: "⏰",
    message: "Order within {countdown} for delivery by {eta_date}",
    toneDefault: "warning",
    isPro: false,
    isBuiltIn: true,
    supportsCountdown: true,
    placements: "product,cart",
  },
  {
    templateId: "ships_today",
    name: "Ships Today Message",
    description: "Same-day shipping notification",
    icon: "✈️",
    message: "Ships today if ordered before {cutoff_time}",
    toneDefault: "info",
    isPro: false,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart",
  },

  // Pro templates
  {
    templateId: "holiday_shipping",
    name: "Holiday Shipping Notice",
    description: "Seasonal delivery cutoff dates",
    icon: "🎄",
    message: "Order by Dec 20 for Christmas delivery",
    toneDefault: "warning",
    isPro: true,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart,checkout",
  },
  {
    templateId: "weekend_delay",
    name: "Weekend Delay Notice",
    description: "Weekend order handling notice",
    icon: "📅",
    message: "Weekend orders ship Monday",
    toneDefault: "info",
    isPro: true,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart,checkout",
  },
  {
    templateId: "international_shipping",
    name: "International Shipping",
    description: "Cross-border delivery estimates",
    icon: "🌍",
    message: "International delivery: {eta_min}-{eta_max} business days",
    toneDefault: "info",
    isPro: true,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart,checkout",
  },
  {
    templateId: "premium_fast_delivery",
    name: "Premium Fast Delivery",
    description: "Express shipping option",
    icon: "⚡",
    message: "Express delivery: Get it tomorrow with {shipping_method}",
    toneDefault: "success",
    isPro: true,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart,checkout",
  },
];

async function seedTemplates() {
  console.log("Seeding message templates...");

  for (const template of builtInTemplates) {
    await prisma.messageTemplate.upsert({
      where: { templateId: template.templateId },
      update: template,
      create: template,
    });
    console.log(`✓ Seeded template: ${template.name}`);
  }

  console.log("Message templates seeded successfully!");
}

seedTemplates()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
