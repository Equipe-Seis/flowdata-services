
import { Status, PersonType } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
//@Exclude()
export class ResponseUserDto {


    @Expose()
    name?: string;

    @Expose()
    personType?: PersonType;

    @Expose()
    documentNumber?: string;

    @Expose()
    birthDate?: string;

    @Expose()
    status?: Status;


    @Expose()
    email?: string;


}
