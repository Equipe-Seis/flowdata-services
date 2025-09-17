
import { PersonType } from '@domain/person/enums/person-type.enum';
import { Status } from '@domain/shared/enums/status.enum';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class PermissionResponseDto {
    @Expose()
    permission: {
        name: string;
    };
}

export class UserProfileResponseDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    description: string;

    @Expose()
    @Type(() => PermissionResponseDto)
    permissions: PermissionResponseDto[];
}

export class PersonResponseDto {
    @Expose()
    id?: number;

    @Expose()
    name: string;

    @Expose()
    personType: PersonType;

    @Expose()
    documentNumber: string;

    @Expose()
    birthDate: Date | null;

    @Expose()
    status: Status;

    @Expose()
    email: string | null;
}

export class ResponseUserDto {
    @Expose()
    id: number;

    @Exclude() // Exclui o hash da resposta
    hash: string;

    @Expose()
    @Type(() => PersonResponseDto)
    person: PersonResponseDto;

    @Expose()
    @Type(() => UserProfileResponseDto)
    userProfiles: UserProfileResponseDto[];
}
