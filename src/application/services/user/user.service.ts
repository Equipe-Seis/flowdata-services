
//src\application\services\user\user.service.ts



import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from '@application/dto/user/create-user.dto';
import { User } from '@domain/user/user.entity';
import { Person } from '@domain/shared/person/person.entity';
import { IUserRepository } from '@application/persistence/repository/interfaces/iuser.repository';
import { IPersonRepository } from '@application/persistence/repository/interfaces/shared/iperson.repository';
import { PersonType, Status } from '@prisma/client';
import bcrypt from 'bcrypt';
@Injectable()
export class UserService {
    constructor(
        @Inject(IUserRepository) private userRepository: IUserRepository,
        @Inject(IPersonRepository) private personRepository: IPersonRepository,
    ) { }

    async createUser(dto: CreateUserDto): Promise<User> {
        const personDto = dto.person;

        // Cria a pessoa primeiro
        const person = await this.personRepository.create({
            name: personDto.name,
            documentNumber: personDto.documentNumber,
            birthDate: personDto.birthDate ? new Date(personDto.birthDate) : null,
            personType: PersonType.INDIVIDUAL,
            status: Status.ACTIVE,
            email: dto.email,
        });

        // Criptografa a senha
        const passwordHash = await bcrypt.hash(dto.password, 10);

        // Cria o usuário com a pessoa associada
        const user = new User(0, person, passwordHash);
        return this.userRepository.create(user);
    }

    async getMe(userId: number): Promise<User | null> {
        return this.findById(userId);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }

    async findById(id: number): Promise<User | null> {
        return this.userRepository.findById(id);
    }
}
