/*
  Warnings:

  - You are about to drop the `CodeJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CodeJobLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CodeWorker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CodeWorkspace` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CodeWorkspaceVersion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CodeJob";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CodeJobLog";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CodeWorker";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CodeWorkspace";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CodeWorkspaceVersion";
PRAGMA foreign_keys=on;
