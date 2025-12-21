-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "appEnabled" BOOLEAN NOT NULL DEFAULT true,
    "excludeWeekends" BOOLEAN NOT NULL DEFAULT true,
    "skipHolidays" BOOLEAN NOT NULL DEFAULT true,
    "activeTemplateId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Store" ("activeTemplateId", "createdAt", "excludeWeekends", "id", "isActive", "plan", "shop", "skipHolidays", "updatedAt") SELECT "activeTemplateId", "createdAt", "excludeWeekends", "id", "isActive", "plan", "shop", "skipHolidays", "updatedAt" FROM "Store";
DROP TABLE "Store";
ALTER TABLE "new_Store" RENAME TO "Store";
CREATE UNIQUE INDEX "Store_shop_key" ON "Store"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
