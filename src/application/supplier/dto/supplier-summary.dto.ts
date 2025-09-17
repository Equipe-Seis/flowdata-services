export class SupplierSummaryDto {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly email: string | null,
        public readonly documentNumber: string,
        public readonly status: string,
        public readonly tradeName?: string,
    ) { }

}
