import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { SearchCnpjResponseDto } from '@/application/shared/cnpj/dto/search-cnpj-response.dto';


@Injectable()
export class SearchCnpjService {
    private readonly apiUrl = 'https://www.receitaws.com.br/v1/cnpj/';

    async searchCnpj(cnpj: string): Promise<SearchCnpjResponseDto> {
        try {
            const response = await axios.get(`${this.apiUrl}${cnpj}`);
            return this.mapResponseToDto(response.data);
        } catch (error) {
            throw new Error('Error consulting CNPJ: ' + (error as Error).message);
        }
    }

    private mapResponseToDto(response: any): SearchCnpjResponseDto {
        const dto = new SearchCnpjResponseDto();
        dto.cnpj = response.cnpj;
        dto.nome = response.nome;
        dto.fantasia = response.fantasia;
        dto.endereco = response.endereco;
        dto.abertura = response.abertura;
        dto.situacao = response.situacao;
        dto.tipo = response.tipo;
        dto.porte = response.porte;
        dto.natureza_juridica = response.natureza_juridica;
        dto.logradouro = response.logradouro;
        dto.numero = response.numero;
        dto.municipio = response.municipio;
        dto.bairro = response.bairro;
        dto.uf = response.uf;
        dto.cep = response.cep;
        dto.email = response.email;
        dto.telefone = response.telefone;
        return dto;
    }
}

