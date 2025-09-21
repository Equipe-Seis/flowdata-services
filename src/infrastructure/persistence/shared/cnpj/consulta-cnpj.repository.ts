import { Injectable } from '@nestjs/common';
import { IConsultaCnpjRepository } from '@/application/shared/cnpj/persistence/iconsulta-cnpj.repository';
import { ConsultaCnpjResponseDto } from '@/application/shared/cnpj/dto/consulta-cnpj-response.dto';

@Injectable()
export class ConsultaCnpjRepository implements IConsultaCnpjRepository {
    private readonly cnpjData: ConsultaCnpjResponseDto[] = [];

    async save(cnpjData: ConsultaCnpjResponseDto): Promise<void> {
        this.cnpjData.push(cnpjData);
    }

    async findByCnpj(cnpj: string): Promise<ConsultaCnpjResponseDto | undefined> {
        return this.cnpjData.find(item => item.cnpj === cnpj);
    }
}