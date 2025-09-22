/*
  Warnings:

  - Changed the type of `unitOfMeasure` on the `CheckingLine` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."TransferType" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "public"."UnitOfMeasure" AS ENUM ('KG', 'UN');

-- AlterTable
ALTER TABLE "public"."CheckingLine" DROP COLUMN "unitOfMeasure",
ADD COLUMN     "unitOfMeasure" "public"."UnitOfMeasure" NOT NULL;

-- CreateTable
CREATE TABLE "public"."InventTransfer" (
    "id" SERIAL NOT NULL,
    "transferType" "public"."TransferType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventTransferLine" (
    "id" SERIAL NOT NULL,
    "transferQty" DECIMAL(65,30) NOT NULL,
    "unitOfMeasure" "public"."UnitOfMeasure" NOT NULL,
    "inventTransferId" INTEGER NOT NULL,
    "supplyItemId" INTEGER NOT NULL,
    "checkingLineId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventTransferLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventSum" (
    "id" SERIAL NOT NULL,
    "supplyItemId" INTEGER NOT NULL,
    "unitOfMeasure" "public"."UnitOfMeasure" NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventSum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventSumHistory" (
    "id" SERIAL NOT NULL,
    "unitOfMeasure" "public"."UnitOfMeasure" NOT NULL,
    "previousQty" DECIMAL(65,30) NOT NULL,
    "newQty" DECIMAL(65,30) NOT NULL,
    "changedQty" DECIMAL(65,30) NOT NULL,
    "changeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplyItemId" INTEGER NOT NULL,
    "transferLineId" INTEGER NOT NULL,

    CONSTRAINT "InventSumHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventSumBatchCheckpoint" (
    "id" SERIAL NOT NULL,
    "lastProcessedTransferId" INTEGER NOT NULL,

    CONSTRAINT "InventSumBatchCheckpoint_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."InventTransferLine" ADD CONSTRAINT "InventTransferLine_checkingLineId_fkey" FOREIGN KEY ("checkingLineId") REFERENCES "public"."CheckingLine"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventTransferLine" ADD CONSTRAINT "InventTransferLine_inventTransferId_fkey" FOREIGN KEY ("inventTransferId") REFERENCES "public"."InventTransfer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventTransferLine" ADD CONSTRAINT "InventTransferLine_supplyItemId_fkey" FOREIGN KEY ("supplyItemId") REFERENCES "public"."SupplyItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventSum" ADD CONSTRAINT "InventSum_supplyItemId_fkey" FOREIGN KEY ("supplyItemId") REFERENCES "public"."SupplyItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventSumHistory" ADD CONSTRAINT "InventSumHistory_supplyItemId_fkey" FOREIGN KEY ("supplyItemId") REFERENCES "public"."SupplyItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventSumHistory" ADD CONSTRAINT "InventSumHistory_transferLineId_fkey" FOREIGN KEY ("transferLineId") REFERENCES "public"."InventTransferLine"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
