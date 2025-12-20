-- AlterTable
ALTER TABLE "Analytics" ADD COLUMN "sessionId" TEXT;

-- CreateIndex
CREATE INDEX "Analytics_storeId_sessionId_idx" ON "Analytics"("storeId", "sessionId");
