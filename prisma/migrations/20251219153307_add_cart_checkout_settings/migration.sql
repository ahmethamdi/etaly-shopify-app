-- CreateTable
CREATE TABLE "CartCheckoutSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "cartEnabled" BOOLEAN NOT NULL DEFAULT true,
    "cartPosition" TEXT NOT NULL DEFAULT 'under_product_title',
    "cartStyle" TEXT NOT NULL DEFAULT 'info',
    "cartAggregation" TEXT NOT NULL DEFAULT 'latest',
    "checkoutEnabled" BOOLEAN NOT NULL DEFAULT true,
    "checkoutPosition" TEXT NOT NULL DEFAULT 'order_summary_section',
    "checkoutStyle" TEXT NOT NULL DEFAULT 'success',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CartCheckoutSettings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CartCheckoutSettings_storeId_key" ON "CartCheckoutSettings"("storeId");

-- CreateIndex
CREATE INDEX "CartCheckoutSettings_storeId_idx" ON "CartCheckoutSettings"("storeId");
