import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkActiveTemplate() {
  console.log("=== ACTIVE TEMPLATE CHECK ===\n");

  const store = await prisma.store.findFirst({
    include: {
      activeTemplate: true,
    },
  });

  if (!store) {
    console.log("❌ No store found");
    return;
  }

  console.log("Store:", store.shop);
  console.log("Active Template ID:", store.activeTemplateId);

  if (store.activeTemplate) {
    console.log("\n✅ Active Template:");
    console.log("  Name:", store.activeTemplate.name);
    console.log("  Message:", store.activeTemplate.message);
    console.log("  Tone:", store.activeTemplate.toneDefault);
  } else {
    console.log("\n❌ No active template set!");
  }

  await prisma.$disconnect();
}

checkActiveTemplate().catch(console.error);
