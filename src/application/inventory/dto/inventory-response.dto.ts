import { Status } from "@prisma/client";

export class InventoryResponseDto {
	public formattedUpdatedAt: string;

	constructor(
		public id: number,
		public unitOfMeasure: string,
		public updatedAt: Date,
		public quantity: number,
		public supplyItem: InventoryResponseSupplyItemDto,
	) {
		this.formattedUpdatedAt = this.updatedAt.toLocaleString('pt-BR', {
			dateStyle: 'short',
			timeStyle: 'medium',
		});
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