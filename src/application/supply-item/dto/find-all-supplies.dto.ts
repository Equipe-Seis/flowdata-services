import { IsString, IsOptional, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { Status } from '@prisma/client';

const transformToArray = ({ value }) => {
    if (value && !Array.isArray(value)) {
        return [value];
    }
    return value;
};

export class FindAllSuppliesDto {
    @IsString()
    @IsOptional()
    search?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @Transform(transformToArray)
    tipoInsumo?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @Transform(transformToArray)
    fornecedor?: string[];

    @IsArray()
    @IsOptional()
    @Transform(transformToArray)
    statusInsumo?: Status[];
}
