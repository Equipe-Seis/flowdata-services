
//src\application\services\user\user.service.ts
import {
    Inject,
    Injectable,
    ConflictException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '@application/dto/user/create-user.dto';
import { UpdateUserDto } from '@application/dto/user/update-user.dto';
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

        // Verifying if the document number already exists
        const existingByDocument = await this.personRepository.findByDocumentNumber(personDto.documentNumber);
        if (existingByDocument) {
            throw new ConflictException('Document number is already in use.');
        }

        // Verifying if the email is already in use
        if (!personDto.email) {
            throw new BadRequestException('Email is required.');
        }

        const existingByEmail = await this.personRepository.findByEmail(personDto.email);
        if (existingByEmail) {
            throw new ConflictException('Email is already in use.');
        }

        // Creating the person (ensuring no duplicate document number)
        const person = await this.personRepository.create({
            name: personDto.name,
            documentNumber: personDto.documentNumber,
            birthDate: personDto.birthDate ? new Date(personDto.birthDate) : null,
            personType: PersonType.individual,
            status: Status.active,
            email: personDto.email,
        });

        // Creating the password hash
        const passwordHash = await bcrypt.hash(dto.password, 10);

        // Creating the user associated with the newly created person
        const user = new User(0, person, passwordHash);  // Initialize with id = 0 because the id will be generated in the database
        const result = await this.userRepository.create(user); // Create the user

        // Await the Promise<Result<User>> to resolve
        if (result.isFailure) {
            throw new ConflictException(result.getError().message); // Custom exception with the error message
        }

        return result.getValue(); // Return the value (User) if successful
    }

    // Método para buscar o usuário logado
    async getMe(userId: number): Promise<User | null> {
        const result = await this.userRepository.findById(userId);

        if (result.isFailure) {
            throw new NotFoundException(result.getError().message); // Se falhou, lança a exceção
        }

        return result.getValue(); // Retorna o valor (User) se for sucesso
    }

    // Método para buscar usuário por e-mail
    async findByEmail(email: string): Promise<User | null> {
        const result = await this.userRepository.findByEmail(email);

        // Espera o Promise<Result<User>> ser resolvido
        if (result.isFailure) {
            throw new NotFoundException(result.getError().message); // Se falhou, lança a exceção
        }

        return result.getValue(); // Retorna o valor (User) se for sucesso
    }

    // Método para buscar usuário por ID
    async findById(id: number): Promise<User | null> {
        const result = await this.userRepository.findById(id);

        // Espera o Promise<Result<User>> ser resolvido
        if (result.isFailure) {
            throw new NotFoundException(result.getError().message); // Se falhou, lança a exceção
        }

        return result.getValue(); // Retorna o valor (User) se for sucesso
    }

    // Método para atualizar usuário
    async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
        // Encontra o usuário
        const result = await this.userRepository.findById(id);

        // Espera o Promise<Result<User>> ser resolvido
        if (result.isFailure) throw new NotFoundException(result.getError().message);

        const user = result.getValue(); // Obtém o valor (User) se não for falha

        // Atualiza senha se informada
        if (dto.hash) {
            user.hash = await bcrypt.hash(dto.hash, 10);
        }

        // Atualiza os campos de Person
        if (dto.name) user.person.name = dto.name;
        if (dto.personType) user.person.personType = dto.personType;
        if (dto.documentNumber) user.person.documentNumber = dto.documentNumber;
        if (dto.birthDate) user.person.birthDate = new Date(dto.birthDate);
        if (dto.status) user.person.status = dto.status;
        if (dto.email) user.person.email = dto.email;

        // Atualiza o usuário
        const updateResult = await this.userRepository.update(user);

        // Espera o Promise<Result<User>> ser resolvido
        if (updateResult.isFailure) {
            throw new ConflictException(updateResult.getError().message);
        }

        return updateResult.getValue(); // Retorna o usuário atualizado
    }

    // Método para deletar usuário
    async deleteUser(id: number): Promise<void> {
        const result = await this.userRepository.findById(id);

        // Espera o Promise<Result<User>> ser resolvido
        if (result.isFailure) throw new NotFoundException(result.getError().message);

        const user = result.getValue(); // Obtém o valor (User) se não for falha

        await this.userRepository.delete(user.id);
    }
}
