-- AlterTable
ALTER TABLE "public"."SupplyItem" ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'active',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'Indefinido';
