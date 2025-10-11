import { UnitOfMeasure } from '@prisma/client';
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCheckingLineDto {
	@IsNotEmpty()
	@IsNumber()
	checkingId: number;

	@IsNotEmpty()
	@IsNumber()
	supplyItemId: number;

	@IsNotEmpty()
	@IsNumber()
	receivedQty: number;

	@IsNotEmpty()
	@IsString()
	@IsIn(['KG', 'UN']) // TODO: temp, convert into Enum or Table
	unitOfMeasure: UnitOfMeasure;
}
