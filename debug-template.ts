import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debugTemplate() {
  console.log("=== DEBUG TEMPLATE ===\n");

  // 1. Check store
  const stores = await prisma.store.findMany({
    select: {
      id: true,
      shop: true,
      activeTemplateId: true,
    },
  });

  console.log("1. STORES:");
  console.log(JSON.stringify(stores, null, 2));

  // 2. Check templates
  const templates = await prisma.messageTemplate.findMany({
    select: {
      id: true,
      templateId: true,
      name: true,
      message: true,
    },
  });

  console.log("\n2. TEMPLATES:");
  console.log(JSON.stringify(templates, null, 2));

  // 3. Check active template
  if (stores.length > 0 && stores[0].activeTemplateId) {
    const activeTemplate = await prisma.messageTemplate.findUnique({
      where: { templateId: stores[0].activeTemplateId },
    });

    console.log("\n3. ACTIVE TEMPLATE:");
    console.log(JSON.stringify(activeTemplate, null, 2));
  }

  await prisma.$disconnect();
}

debugTemplate()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
