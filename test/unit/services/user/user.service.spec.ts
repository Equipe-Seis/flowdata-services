//test\unit\services\user\user.service.spec.ts
//npm run test:unit
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@application/user/user.service';
import { IUserRepository } from '@application/persistence/repository/interfaces/iuser.repository';
import { IPersonRepository } from '@application/persistence/repository/interfaces/shared/iperson.repository';
import { CreateUserDto } from '@application/user/dto/create-user.dto';
import { UpdateUserDto } from '@application/user/dto/update-user.dto';
import {
	ConflictException,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { PersonType, Status } from '@prisma/client';
import { User } from '@domain/user/user.model';
import { Person } from '@domain/person/person.model';
import * as bcrypt from 'bcrypt';
import { Result } from '@domain/shared/result/result.pattern'; // Certifique-se de importar o Result

jest.mock('bcrypt');

describe('UserService', () => {
    let service: UserService;
    let userRepository: jest.Mocked<IUserRepository>;
    let personRepository: jest.Mocked<IPersonRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: IUserRepository,
                    useValue: {
                        create: jest.fn(),
                        findById: jest.fn(),
                        findByEmail: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                    },
                },
                {
                    provide: IPersonRepository,
                    useValue: {
                        findByDocumentNumber: jest.fn(),
                        findByEmail: jest.fn(),
                        create: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get(UserService);
        userRepository = module.get(IUserRepository);
        personRepository = module.get(IPersonRepository);
    });

    describe('createUser', () => {
        const dto: CreateUserDto = {
            password: 'strongpass',
            person: {
                name: 'John Doe',
                email: 'john@example.com',
                documentNumber: '12345678900',
                birthDate: '1990-01-01',
                personType: PersonType.individual,
            },
        };

        it('should throw if document already exists', async () => {
            personRepository.findByDocumentNumber.mockResolvedValueOnce({} as any);
            await expect(service.createUser(dto)).rejects.toThrow(ConflictException);
        });

        it('should throw if email is not provided', async () => {
            const badDto = { ...dto, person: { ...dto.person, email: undefined } };
            await expect(service.createUser(badDto as any)).rejects.toThrow(BadRequestException);
        });

        it('should throw if email already exists', async () => {
            personRepository.findByDocumentNumber.mockResolvedValueOnce(null);
            personRepository.findByEmail.mockResolvedValueOnce({} as any);
            await expect(service.createUser(dto)).rejects.toThrow(ConflictException);
        });

        it('should create user if data is valid', async () => {
            personRepository.findByDocumentNumber.mockResolvedValueOnce(null);
            personRepository.findByEmail.mockResolvedValueOnce(null);
            personRepository.create.mockResolvedValueOnce({
                id: 1,
                name: dto.person.name,
                documentNumber: dto.person.documentNumber,
                birthDate: dto.person.birthDate ? new Date(dto.person.birthDate) : null,
                email: dto.person.email,
                status: Status.active,
                personType: PersonType.individual,
            } as Person);

            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

            userRepository.create.mockResolvedValueOnce(Result.Ok(new User(1, {
                id: 10,
                name: dto.person.name,
                documentNumber: dto.person.documentNumber,
                birthDate: dto.person.birthDate ? new Date(dto.person.birthDate) : null,
                email: dto.person.email,
                status: Status.active,
                personType: PersonType.individual,
            } as Person, 'hashedpassword')));

            const result = await service.createUser(dto);
            expect(result).toBeDefined();
            expect(result.hash).toBe('hashedpassword');
            expect(userRepository.create).toHaveBeenCalled();
        });
    });

    describe('getMe', () => {
        it('should return user by id', async () => {
            const mockUser = { id: 1 } as User;
            userRepository.findById.mockResolvedValueOnce(Result.Ok(mockUser));
            const result = await service.getMe(1);
            expect(result).toBe(mockUser);
        });
    });

    describe('updateUser', () => {
        it('should throw if user not found', async () => {
            userRepository.findById.mockResolvedValueOnce(Result.NotFound('User not found'));
            await expect(service.updateUser(1, {})).rejects.toThrow(NotFoundException);
        });

        it('should update and return user', async () => {
            const user = new User(1, {
                id: 10,
                name: 'Old Name',
                documentNumber: '11111111111',
                birthDate: new Date('1990-01-01'),
                email: 'old@example.com',
                personType: PersonType.individual,
                status: Status.active,
            } as Person, 'oldhash');

            userRepository.findById.mockResolvedValueOnce(Result.Ok(user));
            userRepository.update.mockResolvedValueOnce(Result.Ok(user));

            const dto: UpdateUserDto = {
                name: 'New Name',
                email: 'new@example.com',
                hash: 'newpass',
            };

            (bcrypt.hash as jest.Mock).mockResolvedValue('newhashed');

            const result = await service.updateUser(1, dto);
            expect(result.person.name).toBe('New Name');
            expect(result.hash).toBe('newhashed');
        });
    });

    describe('deleteUser', () => {
        it('should throw if user not found', async () => {
            userRepository.findById.mockResolvedValueOnce(Result.NotFound('User not found'));
            await expect(service.deleteUser(1)).rejects.toThrow(NotFoundException);
        });

        it('should delete user if exists', async () => {
            userRepository.findById.mockResolvedValueOnce(Result.Ok({ id: 1 } as User));
            await service.deleteUser(1);
            expect(userRepository.delete).toHaveBeenCalledWith(1);
        });
    });
});
