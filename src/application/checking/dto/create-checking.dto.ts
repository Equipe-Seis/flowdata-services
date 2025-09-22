import { IsDateString, IsOptional } from 'class-validator';

export class CreateCheckingDto {
	@IsOptional()
	@IsDateString()
	receiptDate?: Date;
}