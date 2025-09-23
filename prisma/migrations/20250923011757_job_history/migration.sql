-- CreateTable
CREATE TABLE "public"."InventTransferErrors" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "retried" BOOLEAN NOT NULL DEFAULT false,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventTransferErrors_pkey" PRIMARY KEY ("id")
);
