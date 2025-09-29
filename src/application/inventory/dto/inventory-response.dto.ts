import { Status } from "@prisma/client";

export class InventoryResponseDto {
    constructor(
        public id: number,
        public unitOfMeasure: string,
        public updatedAt: Date,
        public supplyItem: InventoryResponseSupplyItemDto
    ) {

    }
}

export class InventoryResponseSupplyItemDto {
    constructor(
        public id: number,
        public name: string,
        public code: string,
        public status: Status,
        public supplier: InventoryResponseItemSupplierDto,
        public description: string | null,
    ) {}
}

export class InventoryResponseItemSupplierDto {
    constructor(
        public id: number,
        public tradeName: string | null,
    ) {}
}