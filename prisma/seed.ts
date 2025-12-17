import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a test store
  const store = await prisma.store.upsert({
    where: { shop: "etaly-test-2.myshopify.com" },
    update: {},
    create: {
      shop: "etaly-test-2.myshopify.com",
      plan: "free",
      isActive: true,
    },
  });

  console.log("✅ Store created:", store.shop);

  // Create settings for the store
  const settings = await prisma.settings.upsert({
    where: { storeId: store.id },
    update: {},
    create: {
      storeId: store.id,
      defaultLanguage: "en",
      dateFormat: "short",
      showOnProductPage: true,
      showOnCartPage: true,
      showOnCheckout: false,
      productScope: "all",
      customCSS: "",
    },
  });

  console.log("✅ Settings created");

  // Create sample delivery rules
  const germanRule = await prisma.deliveryRule.create({
    data: {
      storeId: store.id,
      name: "Standard Shipping – Germany",
      countries: JSON.stringify(["DE"]),
      minDays: 2,
      maxDays: 3,
      carrier: "DHL Standard",
      cutoffTime: "14:00",
      isActive: true,
      priority: 100,
    },
  });

  const euExpressRule = await prisma.deliveryRule.create({
    data: {
      storeId: store.id,
      name: "Express Shipping – EU",
      countries: JSON.stringify(["AT", "BE", "NL", "FR", "IT", "ES"]),
      minDays: 1,
      maxDays: 2,
      carrier: "DPD Express",
      cutoffTime: "16:00",
      isActive: true,
      priority: 90,
    },
  });

  const worldwideRule = await prisma.deliveryRule.create({
    data: {
      storeId: store.id,
      name: "Economy – Worldwide",
      countries: JSON.stringify(["US", "CA", "GB", "AU"]),
      minDays: 5,
      maxDays: 10,
      carrier: "Standard Post",
      cutoffTime: "12:00",
      isActive: true,
      priority: 50,
    },
  });

  const sameDayRule = await prisma.deliveryRule.create({
    data: {
      storeId: store.id,
      name: "Same Day – Berlin",
      countries: JSON.stringify(["DE"]),
      minDays: 0,
      maxDays: 0,
      carrier: "Local Courier",
      cutoffTime: "11:00",
      isActive: false,
      priority: 110,
    },
  });

  console.log("✅ Created 4 delivery rules");

  // Create sample holidays
  const holidays = [
    {
      storeId: store.id,
      name: "New Year's Day",
      date: new Date("2025-01-01"),
      isRecurring: true,
    },
    {
      storeId: store.id,
      name: "Good Friday",
      date: new Date("2025-04-18"),
      isRecurring: false,
    },
    {
      storeId: store.id,
      name: "Christmas Day",
      date: new Date("2025-12-25"),
      isRecurring: true,
    },
    {
      storeId: store.id,
      name: "Boxing Day",
      date: new Date("2025-12-26"),
      isRecurring: true,
    },
  ];

  await prisma.holiday.createMany({
    data: holidays,
  });

  console.log("✅ Created 4 holidays");

  // Create sample analytics data (last 7 days)
  const analyticsData = [];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Impressions for German rule
    for (let j = 0; j < Math.floor(Math.random() * 50) + 20; j++) {
      analyticsData.push({
        storeId: store.id,
        eventType: "impression",
        ruleId: germanRule.id,
        productId: `prod_${Math.floor(Math.random() * 10) + 1}`,
        countryCode: "DE",
        pageType: "product",
        timestamp: date,
      });
    }

    // Clicks for German rule
    for (let j = 0; j < Math.floor(Math.random() * 10) + 5; j++) {
      analyticsData.push({
        storeId: store.id,
        eventType: "click",
        ruleId: germanRule.id,
        productId: `prod_${Math.floor(Math.random() * 10) + 1}`,
        countryCode: "DE",
        pageType: "product",
        timestamp: date,
      });
    }

    // Conversions for German rule
    for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
      analyticsData.push({
        storeId: store.id,
        eventType: "conversion",
        ruleId: germanRule.id,
        productId: `prod_${Math.floor(Math.random() * 10) + 1}`,
        countryCode: "DE",
        pageType: "checkout",
        timestamp: date,
      });
    }

    // Impressions for EU rule
    for (let j = 0; j < Math.floor(Math.random() * 30) + 10; j++) {
      const countries = ["AT", "BE", "NL", "FR", "IT", "ES"];
      analyticsData.push({
        storeId: store.id,
        eventType: "impression",
        ruleId: euExpressRule.id,
        productId: `prod_${Math.floor(Math.random() * 10) + 1}`,
        countryCode: countries[Math.floor(Math.random() * countries.length)],
        pageType: "product",
        timestamp: date,
      });
    }
  }

  await prisma.analytics.createMany({
    data: analyticsData,
  });

  console.log(`✅ Created ${analyticsData.length} analytics events`);
  console.log("\n🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
