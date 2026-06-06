-- CreateTable
CREATE TABLE "AiDatabaseSchema" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "schemaJson" TEXT NOT NULL,
    "rowLimit" INTEGER NOT NULL DEFAULT 100,
    "messageQuota" INTEGER NOT NULL DEFAULT 100,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AiDbChatConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT 'گفتگوی جدید',
    "schemaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AiDbChatConversation_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "AiDatabaseSchema" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiDbChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sql" TEXT,
    "rowCount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiDbChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiDbChatConversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AiDatabaseSchema_active_updatedAt_idx" ON "AiDatabaseSchema"("active", "updatedAt");

-- CreateIndex
CREATE INDEX "AiDbChatConversation_schemaId_updatedAt_idx" ON "AiDbChatConversation"("schemaId", "updatedAt");

-- CreateIndex
CREATE INDEX "AiDbChatMessage_conversationId_createdAt_idx" ON "AiDbChatMessage"("conversationId", "createdAt");
