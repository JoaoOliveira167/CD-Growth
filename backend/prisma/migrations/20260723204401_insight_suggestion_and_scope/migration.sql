/*
  Warnings:

  - Added the required column `code` to the `insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `suggestion` to the `insights` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_insights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'info',
    "scope" TEXT NOT NULL DEFAULT 'global',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_insights" ("createdAt", "description", "id", "level", "title") SELECT "createdAt", "description", "id", "level", "title" FROM "insights";
DROP TABLE "insights";
ALTER TABLE "new_insights" RENAME TO "insights";
CREATE INDEX "insights_code_idx" ON "insights"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
