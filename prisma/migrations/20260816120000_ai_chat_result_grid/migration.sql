-- Persist query results so inline chat grids remain available after reload.
ALTER TABLE "AiDbChatMessage" ADD COLUMN "resultJson" TEXT;
