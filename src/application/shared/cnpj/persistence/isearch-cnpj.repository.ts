export interface ISearchCnpjRepository {
    save(cnpjData: any): Promise<void>;
    findByCnpj(cnpj: string): Promise<any | undefined>;
}
export const ISearchCnpjRepository = Symbol('ISearchCnpjRepository');

