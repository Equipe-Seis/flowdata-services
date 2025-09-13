export type SupplierSummary = {
    id: number;
    name: string;
    email: string | null;
    documentNumber: string;
    status: string;
    tradeName?: string;
};