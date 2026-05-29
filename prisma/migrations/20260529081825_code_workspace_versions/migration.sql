-- CreateTable
CREATE TABLE "CodeWorkspace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "language" TEXT NOT NULL DEFAULT 'typescript',
    "currentVersion" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "updatedByUserId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CodeWorkspaceVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" TEXT NOT NULL,
    "snapshotHash" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "isAutosave" BOOLEAN NOT NULL DEFAULT false,
    "clientRequestId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "meta" TEXT NOT NULL DEFAULT '{}',
    "sizeBytes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    CONSTRAINT "CodeWorkspaceVersion_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "CodeWorkspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CodeWorkspace_slug_idx" ON "CodeWorkspace"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CodeWorkspace_createdByUserId_slug_key" ON "CodeWorkspace"("createdByUserId", "slug");

-- CreateIndex
CREATE INDEX "CodeWorkspaceVersion_workspaceId_createdAt_idx" ON "CodeWorkspaceVersion"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "CodeWorkspaceVersion_snapshotHash_idx" ON "CodeWorkspaceVersion"("snapshotHash");

-- CreateIndex
CREATE UNIQUE INDEX "CodeWorkspaceVersion_workspaceId_version_key" ON "CodeWorkspaceVersion"("workspaceId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "CodeWorkspaceVersion_workspaceId_clientRequestId_key" ON "CodeWorkspaceVersion"("workspaceId", "clientRequestId");
