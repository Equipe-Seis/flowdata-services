import { UnitOfMeasure } from '@prisma/client';
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateCheckingLineDto {
	@IsNotEmpty()
	@IsNumber()
	receivedQty: number;

	@IsNotEmpty()
	@IsString()
	@IsIn(['KG', 'UN']) // TODO: temp, convert into Enum or Table
	unitOfMeasure: UnitOfMeasure;
}
