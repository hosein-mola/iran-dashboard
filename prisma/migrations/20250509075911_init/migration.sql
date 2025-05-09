-- CreateTable
CREATE TABLE "Form" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "context" TEXT NOT NULL DEFAULT '[]',
    "visit" INTEGER NOT NULL DEFAULT 0,
    "submission" INTEGER NOT NULL DEFAULT 0,
    "sharedURL" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "formId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    CONSTRAINT "FormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Form_sharedURL_key" ON "Form"("sharedURL");

-- CreateIndex
CREATE UNIQUE INDEX "Form_userId_name_key" ON "Form"("userId", "name");
