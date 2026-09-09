/*
  Warnings:

  - You are about to drop the column `theme` on the `Portfolio` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Portfolio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Portfolio" DROP COLUMN "theme",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
