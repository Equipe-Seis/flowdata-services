import { TransferType } from "@prisma/client";

export class InventTransferModel {
    constructor(public transferType: TransferType) {
    }
}