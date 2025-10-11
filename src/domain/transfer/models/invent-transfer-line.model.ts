import { UnitOfMeasure } from "@prisma/client";

export class InventTransferLineModel {
    constructor(
        public transferQty: number,
        public unitOfMeasure: UnitOfMeasure,
        public supplyItemId: number,
        public checkingLineId?: number
    ) {

    }
}