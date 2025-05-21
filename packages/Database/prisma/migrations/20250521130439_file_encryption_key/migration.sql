/*
  Warnings:

  - Added the required column `encryptionKey` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_File" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "encryptionKey" TEXT NOT NULL,
    "metaId" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "lastChecked" DATETIME NOT NULL,
    "date" DATETIME NOT NULL
);
INSERT INTO "new_File" ("category", "date", "id", "lastChecked", "metaId", "name", "size", "status", "type", "url") SELECT "category", "date", "id", "lastChecked", "metaId", "name", "size", "status", "type", "url" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
