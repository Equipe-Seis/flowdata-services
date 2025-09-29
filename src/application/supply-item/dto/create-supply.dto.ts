import {
	IsIn,
	IsNotEmpty,
	IsNumber,
	IsPositive,
	IsString,
} from 'class-validator';

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

	@IsString()
	@IsIn(['KG', 'UN'])
	unitOfMeasure?: string;
}
