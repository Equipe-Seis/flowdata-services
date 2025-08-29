/*
  Warnings:

  - The values [PHONE,MOBILE,EMAIL,WHATSAPP] on the enum `ContactType` will be removed. If these variants are still used in the database, this will fail.
  - The values [CUSTOMER,SUPPLIER,PERSON] on the enum `LinkType` will be removed. If these variants are still used in the database, this will fail.
  - The values [INDIVIDUAL,LEGALENTITY] on the enum `PersonType` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACTIVE,INACTIVE] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `phone` on the `Supplier` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ContactType_new" AS ENUM ('phone', 'mobile', 'email', 'whatsapp');
ALTER TABLE "public"."Contact" ALTER COLUMN "type" TYPE "public"."ContactType_new" USING ("type"::text::"public"."ContactType_new");
ALTER TYPE "public"."ContactType" RENAME TO "ContactType_old";
ALTER TYPE "public"."ContactType_new" RENAME TO "ContactType";
DROP TYPE "public"."ContactType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."LinkType_new" AS ENUM ('customer', 'supplier', 'person');
ALTER TABLE "public"."Address" ALTER COLUMN "linkType" TYPE "public"."LinkType_new" USING ("linkType"::text::"public"."LinkType_new");
ALTER TABLE "public"."Contact" ALTER COLUMN "linkType" TYPE "public"."LinkType_new" USING ("linkType"::text::"public"."LinkType_new");
ALTER TYPE "public"."LinkType" RENAME TO "LinkType_old";
ALTER TYPE "public"."LinkType_new" RENAME TO "LinkType";
DROP TYPE "public"."LinkType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."PersonType_new" AS ENUM ('individual', 'legalentity');
ALTER TABLE "public"."Person" ALTER COLUMN "personType" TYPE "public"."PersonType_new" USING ("personType"::text::"public"."PersonType_new");
ALTER TYPE "public"."PersonType" RENAME TO "PersonType_old";
ALTER TYPE "public"."PersonType_new" RENAME TO "PersonType";
DROP TYPE "public"."PersonType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Status_new" AS ENUM ('active', 'inactive');
ALTER TABLE "public"."Person" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Person" ALTER COLUMN "status" TYPE "public"."Status_new" USING ("status"::text::"public"."Status_new");
ALTER TYPE "public"."Status" RENAME TO "Status_old";
ALTER TYPE "public"."Status_new" RENAME TO "Status";
DROP TYPE "public"."Status_old";
ALTER TABLE "public"."Person" ALTER COLUMN "status" SET DEFAULT 'active';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Person" ALTER COLUMN "status" SET DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."Supplier" DROP COLUMN "phone";
