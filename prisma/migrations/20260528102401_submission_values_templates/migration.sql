-- CreateTable
CREATE TABLE "FormSubmissionValue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "submissionId" INTEGER NOT NULL,
    "formId" INTEGER NOT NULL,
    "formVersionId" INTEGER,
    "fieldKey" TEXT NOT NULL,
    "fieldLabel" TEXT NOT NULL DEFAULT '',
    "elementId" TEXT,
    "pageId" TEXT,
    "parentId" TEXT,
    "valueType" TEXT NOT NULL DEFAULT 'text',
    "stringValue" TEXT,
    "numberValue" REAL,
    "booleanValue" BOOLEAN,
    "dateValue" DATETIME,
    "jsonValue" TEXT,
    "rawValue" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FormSubmissionValue_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FormSubmission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FormSubmissionValue_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FormSubmissionValue_formVersionId_fkey" FOREIGN KEY ("formVersionId") REFERENCES "FormVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FormTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'file-text',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "page" TEXT,
    "components" TEXT NOT NULL DEFAULT '[]',
    "context" TEXT NOT NULL DEFAULT '[]',
    "eventConfig" TEXT NOT NULL DEFAULT '[]',
    "scheduleType" TEXT NOT NULL DEFAULT 'monthly',
    "scheduleInterval" INTEGER NOT NULL DEFAULT 1,
    "scheduleConfig" TEXT NOT NULL DEFAULT '{}',
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FormTemplateVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'file-text',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "page" TEXT,
    "components" TEXT NOT NULL DEFAULT '[]',
    "context" TEXT NOT NULL DEFAULT '[]',
    "eventConfig" TEXT NOT NULL DEFAULT '[]',
    "scheduleType" TEXT NOT NULL DEFAULT 'monthly',
    "scheduleInterval" INTEGER NOT NULL DEFAULT 1,
    "scheduleConfig" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FormTemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "templateId" INTEGER,
    "templateVersion" INTEGER,
    CONSTRAINT "Form_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Form_submoduleId_fkey" FOREIGN KEY ("submoduleId") REFERENCES "Submodule" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Form_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Form" ("assignedUserId", "components", "context", "createdAt", "currentVersion", "description", "eventConfig", "id", "name", "page", "published", "roleId", "scheduleConfig", "scheduleInterval", "scheduleType", "sharedURL", "submission", "submoduleId", "updatedAt", "userId", "visit") SELECT "assignedUserId", "components", "context", "createdAt", "currentVersion", "description", "eventConfig", "id", "name", "page", "published", "roleId", "scheduleConfig", "scheduleInterval", "scheduleType", "sharedURL", "submission", "submoduleId", "updatedAt", "userId", "visit" FROM "Form";
DROP TABLE "Form";
ALTER TABLE "new_Form" RENAME TO "Form";
CREATE UNIQUE INDEX "Form_sharedURL_key" ON "Form"("sharedURL");
CREATE UNIQUE INDEX "Form_userId_name_key" ON "Form"("userId", "name");
CREATE TABLE "new_Submodule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'layers',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "baseTables" TEXT NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Submodule" ("active", "baseTables", "createdAt", "description", "id", "name", "slug", "updatedAt") SELECT "active", "baseTables", "createdAt", "description", "id", "name", "slug", "updatedAt" FROM "Submodule";
DROP TABLE "Submodule";
ALTER TABLE "new_Submodule" RENAME TO "Submodule";
CREATE UNIQUE INDEX "Submodule_slug_key" ON "Submodule"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "FormSubmissionValue_formId_fieldKey_idx" ON "FormSubmissionValue"("formId", "fieldKey");

-- CreateIndex
CREATE UNIQUE INDEX "FormSubmissionValue_submissionId_fieldKey_key" ON "FormSubmissionValue"("submissionId", "fieldKey");

-- CreateIndex
CREATE UNIQUE INDEX "FormTemplate_slug_key" ON "FormTemplate"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FormTemplateVersion_templateId_version_key" ON "FormTemplateVersion"("templateId", "version");
