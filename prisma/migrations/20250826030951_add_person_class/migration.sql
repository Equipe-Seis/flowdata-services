/*
  Warnings:

  - You are about to drop the column `supplierId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `cnpj` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `cpf` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `personType` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[personId]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[personId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `linkType` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personId` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personId` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."ContactType" AS ENUM ('PHONE', 'MOBILE', 'EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "public"."LinkType" AS ENUM ('CUSTOMER', 'SUPPLIER', 'PERSON');

-- DropForeignKey
ALTER TABLE "public"."Address" DROP CONSTRAINT "Address_supplierId_fkey";

-- DropIndex
DROP INDEX "public"."Supplier_cnpj_key";

-- DropIndex
DROP INDEX "public"."Supplier_cpf_key";

-- DropIndex
DROP INDEX "public"."Supplier_email_key";

-- DropIndex
DROP INDEX "public"."User_email_key";

-- AlterTable
ALTER TABLE "public"."Address" DROP COLUMN "supplierId",
ADD COLUMN     "linkType" "public"."LinkType" NOT NULL,
ADD COLUMN     "personId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Supplier" DROP COLUMN "birthDate",
DROP COLUMN "cnpj",
DROP COLUMN "cpf",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "personType",
DROP COLUMN "status",
ADD COLUMN     "personId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "personId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."Person" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "personType" "public"."PersonType" NOT NULL,
    "documentNumber" VARCHAR(20) NOT NULL,
    "birthDate" TIMESTAMP(3),
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "email" TEXT,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" SERIAL NOT NULL,
    "creditLimit" DOUBLE PRECISION NOT NULL,
    "personId" INTEGER NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Contact" (
    "id" SERIAL NOT NULL,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "type" "public"."ContactType" NOT NULL,
    "value" VARCHAR(150) NOT NULL,
    "note" VARCHAR(255),
    "linkType" "public"."LinkType" NOT NULL,
    "personId" INTEGER NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Permission" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProfilePermission" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "ProfilePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_documentNumber_key" ON "public"."Person"("documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Person_email_key" ON "public"."Person"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_personId_key" ON "public"."Customer"("personId");

-- CreateIndex
CREATE INDEX "Contact_personId_idx" ON "public"."Contact"("personId");

-- CreateIndex
CREATE INDEX "UserProfile_userId_idx" ON "public"."UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_profileId_idx" ON "public"."UserProfile"("profileId");

-- CreateIndex
CREATE INDEX "ProfilePermission_profileId_idx" ON "public"."ProfilePermission"("profileId");

-- CreateIndex
CREATE INDEX "ProfilePermission_permissionId_idx" ON "public"."ProfilePermission"("permissionId");

-- CreateIndex
CREATE INDEX "Address_personId_idx" ON "public"."Address"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_personId_key" ON "public"."Supplier"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "User_personId_key" ON "public"."User"("personId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Supplier" ADD CONSTRAINT "Supplier_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contact" ADD CONSTRAINT "Contact_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfilePermission" ADD CONSTRAINT "ProfilePermission_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfilePermission" ADD CONSTRAINT "ProfilePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "public"."Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
