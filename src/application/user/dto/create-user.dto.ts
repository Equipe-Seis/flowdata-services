import { ApiProperty } from '@nestjs/swagger';
import { CreatePersonDto } from '@application/person/dto/create-person.dto';
import { IsNotEmpty, IsString, ValidateNested, IsArray, ArrayNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateUserDto {

    @ApiProperty({ type: () => CreatePersonDto })
    @ValidateNested()
    @Type(() => CreatePersonDto)
    person: CreatePersonDto;

    @ApiProperty({ description: 'Password for the user account.' })
    @IsNotEmpty({ message: 'Password is required.' })
    @IsString({ message: 'Password must be a string.' })
    password: string;

    @ApiProperty({
        type: [Number],
        description: 'List of profile IDs for the user (at least one).',
        example: [1],
    })
    @IsArray({ message: 'Profiles must be an array of numeric IDs.' })
    @ArrayNotEmpty({ message: 'At least one profile must be provided.' })
    @IsNumber({}, { each: true, message: 'Each profile must be a number.' })
    profiles: number[];


}
