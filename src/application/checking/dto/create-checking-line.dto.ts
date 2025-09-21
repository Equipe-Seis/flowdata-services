import { IsIn, IsNotEmpty, IsNumber, IsString } from "class-validator";

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
    @IsIn(['KG', 'UN', 'G', 'ML', 'CM']) // TODO: temp, convert into Enum or Table
	unitOfMeasure: string;
}
