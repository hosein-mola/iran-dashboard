-- CreateTable
CREATE TABLE "FormVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "formId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "page" TEXT,
    "components" TEXT NOT NULL DEFAULT '[]',
    "context" TEXT NOT NULL DEFAULT '[]',
    "eventConfig" TEXT NOT NULL DEFAULT '[]',
    "scheduleType" TEXT NOT NULL DEFAULT 'monthly',
    "scheduleInterval" INTEGER NOT NULL DEFAULT 1,
    "scheduleConfig" TEXT NOT NULL DEFAULT '{}',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FormVersion_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FormEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "formId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "sourceField" TEXT,
    "targetField" TEXT NOT NULL,
    "expression" TEXT NOT NULL,
    "trigger" TEXT NOT NULL DEFAULT 'change',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FormEvent_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FormAssignment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "formId" INTEGER NOT NULL,
    "userId" TEXT,
    "roleId" INTEGER,
    "submoduleId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FormAssignment_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FormAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FormAssignment_submoduleId_fkey" FOREIGN KEY ("submoduleId") REFERENCES "Submodule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Submodule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "baseTables" TEXT NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "roleId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AppUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

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
    "sharedURL" TEXT NOT NULL,
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "eventConfig" TEXT NOT NULL DEFAULT '[]',
    "scheduleType" TEXT NOT NULL DEFAULT 'monthly',
    "scheduleInterval" INTEGER NOT NULL DEFAULT 1,
    "scheduleConfig" TEXT NOT NULL DEFAULT '{}',
    "assignedUserId" TEXT,
    "roleId" INTEGER,
    "submoduleId" INTEGER,
    CONSTRAINT "Form_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Form_submoduleId_fkey" FOREIGN KEY ("submoduleId") REFERENCES "Submodule" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Form" ("components", "context", "createdAt", "description", "id", "name", "page", "published", "sharedURL", "submission", "updatedAt", "userId", "visit") SELECT "components", "context", "createdAt", "description", "id", "name", "page", "published", "sharedURL", "submission", "updatedAt", "userId", "visit" FROM "Form";
DROP TABLE "Form";
ALTER TABLE "new_Form" RENAME TO "Form";
CREATE UNIQUE INDEX "Form_sharedURL_key" ON "Form"("sharedURL");
CREATE UNIQUE INDEX "Form_userId_name_key" ON "Form"("userId", "name");
CREATE TABLE "new_FormSubmission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "formId" INTEGER NOT NULL,
    "formVersionId" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT,
    "roleId" INTEGER,
    "submoduleId" INTEGER,
    "content" TEXT NOT NULL,
    "computedContent" TEXT NOT NULL DEFAULT '{}',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FormSubmission_formVersionId_fkey" FOREIGN KEY ("formVersionId") REFERENCES "FormVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FormSubmission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FormSubmission_submoduleId_fkey" FOREIGN KEY ("submoduleId") REFERENCES "Submodule" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FormSubmission" ("content", "formId", "id", "published") SELECT "content", "formId", "id", "published" FROM "FormSubmission";
DROP TABLE "FormSubmission";
ALTER TABLE "new_FormSubmission" RENAME TO "FormSubmission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "FormVersion_formId_version_key" ON "FormVersion"("formId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "FormAssignment_formId_userId_roleId_submoduleId_key" ON "FormAssignment"("formId", "userId", "roleId", "submoduleId");

-- CreateIndex
CREATE UNIQUE INDEX "Submodule_slug_key" ON "Submodule"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Role_key_key" ON "Role"("key");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");
