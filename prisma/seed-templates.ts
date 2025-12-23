import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const builtInTemplates = [
  // Free templates - Modern & Minimalist
  {
    templateId: "order_today_tomorrow",
    name: "Next Day Arrival",
    description: "Clean next-day delivery",
    icon: "🚀",
    message: "Arrives tomorrow · Order within {countdown}",
    toneDefault: "success",
    isPro: false,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart,checkout",
  },
  {
    templateId: "standard_delivery_range",
    name: "Estimated Arrival",
    description: "Minimalist date range",
    icon: "📦",
    message: "Arrives {eta_min_date}–{eta_max_date}",
    toneDefault: "info",
    isPro: false,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart,checkout",
  },
  {
    templateId: "cutoff_time_warning",
    name: "Countdown Timer",
    description: "Urgency with elegance",
    icon: "⏰",
    message: "{countdown} left · Arrives {eta_date}",
    toneDefault: "warning",
    isPro: false,
    isBuiltIn: true,
    supportsCountdown: true,
    placements: "product,cart",
  },
  {
    templateId: "ships_today",
    name: "Same-Day Dispatch",
    description: "Minimalist shipping notice",
    icon: "✈️",
    message: "Ships today before {cutoff_time}",
    toneDefault: "info",
    isPro: false,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart",
  },

  // Pro templates - Elite & Modern
  {
    templateId: "holiday_shipping",
    name: "Holiday Deadline",
    description: "Seasonal cutoff alert",
    icon: "🎄",
    message: "Order before Dec 20 · Holiday delivery guaranteed",
    toneDefault: "warning",
    isPro: true,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart,checkout",
  },
  {
    templateId: "weekend_delay",
    name: "Weekend Notice",
    description: "Clean weekend message",
    icon: "📅",
    message: "Weekend order · Ships Monday",
    toneDefault: "info",
    isPro: true,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart,checkout",
  },
  {
    templateId: "international_shipping",
    name: "Global Delivery",
    description: "International shipping",
    icon: "🌍",
    message: "Worldwide shipping · {eta_min}–{eta_max} days",
    toneDefault: "info",
    isPro: true,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart,checkout",
  },
  {
    templateId: "premium_fast_delivery",
    name: "Express Delivery",
    description: "Premium fast shipping",
    icon: "⚡",
    message: "Express · Arrives tomorrow via {shipping_method}",
    toneDefault: "success",
    isPro: true,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart,checkout",
  },
  {
    templateId: "free_shipping",
    name: "Free Shipping",
    description: "Complimentary delivery",
    icon: "🎁",
    message: "Free shipping · Arrives {eta_min_date}–{eta_max_date}",
    toneDefault: "success",
    isPro: true,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart,checkout",
  },
  {
    templateId: "in_stock_ready",
    name: "Ready to Ship",
    description: "In stock notification",
    icon: "✅",
    message: "In stock · Ships today, arrives {eta_min_date}",
    toneDefault: "success",
    isPro: true,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product",
  },
  {
    templateId: "eco_shipping",
    name: "Sustainable Delivery",
    description: "Eco-conscious shipping",
    icon: "🌱",
    message: "Carbon-neutral · Arrives {eta_min_date}–{eta_max_date}",
    toneDefault: "success",
    isPro: true,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart,checkout",
  },
  {
    templateId: "gift_ready",
    name: "Gift Packaging",
    description: "Gift-ready delivery",
    icon: "🎁",
    message: "Gift wrapped · Delivered by {eta_max_date}",
    toneDefault: "warning",
    isPro: true,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart",
  },
  {
    templateId: "same_day",
    name: "Same Day",
    description: "Ultra-fast delivery",
    icon: "⚡",
    message: "Same-day delivery · Order now",
    toneDefault: "success",
    isPro: true,
    isBuiltIn: true,
    supportsCountdown: false,
    placements: "product,cart",
  },
  {
    templateId: "guaranteed",
    name: "Delivery Guarantee",
    description: "Confidence builder",
    icon: "💯",
    message: "Guaranteed by {eta_max_date} · Money-back promise",
    toneDefault: "info",
    isPro: false,
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
