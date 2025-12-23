-- CreateTable
CREATE TABLE "ProductTargeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "overrideMinDays" INTEGER,
    "overrideMaxDays" INTEGER,
    "overrideProcessingDays" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductTargeting_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductTargeting_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "DeliveryRule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ProductTargeting_storeId_productId_idx" ON "ProductTargeting"("storeId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTargeting_ruleId_productId_variantId_key" ON "ProductTargeting"("ruleId", "productId", "variantId");
