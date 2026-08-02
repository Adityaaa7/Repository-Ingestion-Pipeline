-- AlterTable
ALTER TABLE "Repository" ADD COLUMN     "fileTree" JSONB,
ADD COLUMN     "languages" JSONB,
ADD COLUMN     "statistics" JSONB;
