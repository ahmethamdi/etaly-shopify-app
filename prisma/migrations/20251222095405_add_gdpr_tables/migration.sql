-- CreateTable
CREATE TABLE "ComplianceLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "requestedAt" DATETIME NOT NULL,
    "processedAt" DATETIME,
    "payload" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "customerId" TEXT,
    "eventType" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ComplianceLog_shop_requestType_idx" ON "ComplianceLog"("shop", "requestType");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_customerId_idx" ON "AnalyticsEvent"("customerId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_storeId_idx" ON "AnalyticsEvent"("storeId");
