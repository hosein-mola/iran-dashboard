-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Form" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "page" TEXT,
    "components" TEXT NOT NULL DEFAULT '[]',
    "description" TEXT NOT NULL DEFAULT '',
    "context" TEXT NOT NULL DEFAULT '[]',
    "visit" INTEGER NOT NULL DEFAULT 0,
    "submission" INTEGER NOT NULL DEFAULT 0,
    "sharedURL" TEXT NOT NULL
);
INSERT INTO "new_Form" ("components", "context", "createdAt", "description", "id", "name", "page", "published", "sharedURL", "submission", "updatedAt", "userId", "visit") SELECT "components", "context", "createdAt", "description", "id", "name", "page", "published", "sharedURL", "submission", "updatedAt", "userId", "visit" FROM "Form";
DROP TABLE "Form";
ALTER TABLE "new_Form" RENAME TO "Form";
CREATE UNIQUE INDEX "Form_sharedURL_key" ON "Form"("sharedURL");
CREATE UNIQUE INDEX "Form_userId_name_key" ON "Form"("userId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
