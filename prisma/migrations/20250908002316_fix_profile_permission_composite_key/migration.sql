/*
  Warnings:

  - The primary key for the `ProfilePermission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ProfilePermission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ProfilePermission" DROP CONSTRAINT "ProfilePermission_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "ProfilePermission_pkey" PRIMARY KEY ("profileId", "permissionId");
