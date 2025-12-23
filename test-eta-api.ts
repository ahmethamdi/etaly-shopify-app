import { PrismaClient } from "@prisma/client";
import ETACalculator from "./app/services/eta-calculator.server";

const prisma = new PrismaClient();

async function testETACalculation() {
  console.log("=== TEST ETA CALCULATION ===\n");

  // Get store
  const store = await prisma.store.findFirst({
    where: { isActive: true },
    include: {
      activeTemplate: true,
    },
  });

  if (!store) {
    console.log("❌ No active store found");
    return;
  }

  console.log("1. STORE INFO:");
  console.log(`   Shop: ${store.shop}`);
  console.log(`   Active Template ID: ${store.activeTemplateId}`);
  console.log(
    `   Active Template Name: ${store.activeTemplate?.name || "NONE"}`
  );
  console.log(
    `   Active Template Message: ${store.activeTemplate?.message || "NONE"}`
  );

  // Calculate ETA
  console.log("\n2. CALCULATING ETA:");
  const result = await ETACalculator.calculate({
    storeId: store.id,
    countryCode: "US",
    orderDate: new Date(),
  });

  if (!result) {
    console.log("❌ No delivery rule matched");
    return;
  }

  console.log(`   ✅ ETA Result:`);
  console.log(`   Message: "${result.message}"`);
  console.log(`   Min Days: ${result.minDays}`);
  console.log(`   Max Days: ${result.maxDays}`);
  console.log(`   Min Date: ${result.minDate.toDateString()}`);
  console.log(`   Max Date: ${result.maxDate.toDateString()}`);

  // Expected vs Actual
  console.log("\n3. VALIDATION:");
  if (store.activeTemplate) {
    console.log(`   Expected (from template): "${store.activeTemplate.message}"`);
    console.log(`   Actual (from ETA calc): "${result.message}"`);

    if (result.message === store.activeTemplate.message) {
      console.log("   ✅ TEMPLATE IS BEING USED (no variables)");
    } else if (result.message.includes(store.activeTemplate.message.split("{")[0])) {
      console.log("   ✅ TEMPLATE IS BEING USED (with variable substitution)");
    } else {
      console.log("   ❌ TEMPLATE IS NOT BEING USED!");
    }
  } else {
    console.log("   ⚠️  No active template set");
  }

  await prisma.$disconnect();
}

testETACalculation().catch((e) => {
  console.error(e);
  process.exit(1);
});
