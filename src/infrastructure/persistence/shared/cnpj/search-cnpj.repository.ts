import { Injectable } from '@nestjs/common';
import { ISearchCnpjRepository } from '@/application/shared/cnpj/persistence/isearch-cnpj.repository';
import { SearchCnpjResponseDto } from '@/application/shared/cnpj/dto/search-cnpj-response.dto';

@Injectable()
export class SearchCnpjRepository implements ISearchCnpjRepository {
    private readonly cnpjData: SearchCnpjResponseDto[] = [];

    async save(cnpjData: SearchCnpjResponseDto): Promise<void> {
        this.cnpjData.push(cnpjData);
    }

    async findByCnpj(cnpj: string): Promise<SearchCnpjResponseDto | undefined> {
        return this.cnpjData.find(item => item.cnpj === cnpj);
    }
}

