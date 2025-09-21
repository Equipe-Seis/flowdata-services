import { IsIn, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateCheckingLineDto {
    @IsNotEmpty()
    @IsNumber()
	receivedQty: number;

    @IsNotEmpty()
    @IsString()
    @IsIn(['KG', 'UN', 'G', 'ML', 'CM']) // TODO: temp, convert into Enum or Table
	unitOfMeasure: string;
}