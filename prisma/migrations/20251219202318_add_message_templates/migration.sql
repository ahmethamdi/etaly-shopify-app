-- AlterTable
ALTER TABLE "Store" ADD COLUMN "activeTemplateId" TEXT;

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "message" TEXT NOT NULL,
    "toneDefault" TEXT NOT NULL DEFAULT 'info',
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT true,
    "supportsCountdown" BOOLEAN NOT NULL DEFAULT false,
    "placements" TEXT NOT NULL DEFAULT 'product,cart,checkout',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MessageTemplate_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageTemplate_templateId_key" ON "MessageTemplate"("templateId");

-- CreateIndex
CREATE INDEX "MessageTemplate_storeId_idx" ON "MessageTemplate"("storeId");

-- CreateIndex
CREATE INDEX "MessageTemplate_templateId_idx" ON "MessageTemplate"("templateId");
