-- CreateEnum
CREATE TYPE "public"."CheckingStatus" AS ENUM ('draft', 'received', 'cancelled');

-- CreateTable
CREATE TABLE "public"."Checking" (
    "id" SERIAL NOT NULL,
    "receiptDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."CheckingStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Checking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CheckingLine" (
    "id" SERIAL NOT NULL,
    "checkingId" INTEGER NOT NULL,
    "supplyItemId" INTEGER NOT NULL,
    "receivedQty" DECIMAL(65,30) NOT NULL,
    "unitOfMeasure" TEXT NOT NULL,

    CONSTRAINT "CheckingLine_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."CheckingLine" ADD CONSTRAINT "CheckingLine_supplyItemId_fkey" FOREIGN KEY ("supplyItemId") REFERENCES "public"."SupplyItem"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckingLine" ADD CONSTRAINT "CheckingLine_checkingId_fkey" FOREIGN KEY ("checkingId") REFERENCES "public"."Checking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
