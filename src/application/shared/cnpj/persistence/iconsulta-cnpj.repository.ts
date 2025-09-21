
export interface IConsultaCnpjRepository {
    save(cnpjData: any): Promise<void>;
    findByCnpj(cnpj: string): Promise<any | undefined>;
}
export const IConsultaCnpjRepository = Symbol('IConsultaCnpjRepository');