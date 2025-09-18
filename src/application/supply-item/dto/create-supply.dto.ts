import { IsNotEmpty, IsNumber, IsPositive, isString, IsString } from 'class-validator';

export class CreateSupplyDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	code: string;

	@IsNumber()
	@IsPositive()
	price: number;

	@IsNumber()
	@IsPositive()
	supplierId: number;

	@IsString()
	description?: string;
}
