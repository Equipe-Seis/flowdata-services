import {
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class PersonDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString() // ou pode ser enum validator, dependendo do seu enum
  @IsNotEmpty()
  personType: string;

  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  passwordConfirmation: string;

  @ValidateNested()
  @Type(() => PersonDto)
  person: PersonDto;
}
