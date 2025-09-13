import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@application/user/user.service';
import { CreateUserDto } from '@application/user/dto/create-user.dto';
import { UpdateUserDto } from '@application/user/dto/update-user.dto';
import {
	ConflictException,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { Person } from '@prisma/client';
import { PersonType } from '@domain/person/enums/person-type.enum';
import { Status } from '@domain/shared/enums/status.enum';
import * as bcrypt from 'bcrypt';

import { Result } from '@domain/shared/result/result.pattern';
import { IUserRepository } from '@application/user/persistence/iuser.repository';
import { IPersonRepository } from '@application/auth/persistence/iperson.repository';
import { UserWithPerson } from '@domain/user/types/userPerson.type';

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
				personType: PersonType.Individual,
			},
		};

		it('should throw if document already exists', async () => {
			personRepository.findByDocumentNumber.mockResolvedValueOnce({} as any);
			await expect(service.createUser(dto)).rejects.toThrow(ConflictException);
		});

		it('should throw if email is not provided', async () => {
			const badDto = { ...dto, person: { ...dto.person, email: undefined } };
			await expect(service.createUser(badDto as any)).rejects.toThrow(
				BadRequestException,
			);
		});

		it('should throw if email already exists', async () => {
			personRepository.findByDocumentNumber.mockResolvedValueOnce(
				Result.Ok(null),
			);
			personRepository.findByEmail.mockResolvedValueOnce({} as any);
			await expect(service.createUser(dto)).rejects.toThrow(ConflictException);
		});

		it('should create user if data is valid', async () => {
			personRepository.findByDocumentNumber.mockResolvedValueOnce(
				Result.Ok(null),
			);
			personRepository.findByEmail.mockResolvedValueOnce(Result.Ok(null));

			const person = {
				id: 1,
				name: dto.person.name,
				documentNumber: dto.person.documentNumber,
				birthDate: dto.person.birthDate ? new Date(dto.person.birthDate) : null,
				email: dto.person.email,
				status: Status.Active,
				personType: PersonType.Individual,
			} as Person;

			personRepository.create.mockResolvedValueOnce(Result.Ok(person));

			(bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

			userRepository.create.mockResolvedValueOnce(
				Result.Ok({
					id: 1,
					hash: 'hashedpassword',
					personId: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				}),
			);

			const result = await service.createUser(dto);
			const value = result.getValue();

			expect(result).toBeDefined();
			expect(value).toBeDefined();
			expect(value.hash).toBe('hashedpassword');
			expect(userRepository.create).toHaveBeenCalled();
		});
	});

	describe('getMe', () => {
		it('should return user by id', async () => {
			const user = {
				id: 10,
				name: 'old name',
				hash: 'newhashed',
				createdAt: new Date(),
				updatedAt: new Date(),
				person: {
					id: 10,
					name: 'Old Name',
					documentNumber: '11111111111',
					birthDate: new Date('1990-01-01'),
					email: 'old@example.com',
					personType: PersonType.Individual,
					status: Status.Active,
				},
				personId: 10,
			} as UserWithPerson;
			userRepository.findById.mockResolvedValueOnce(Result.Ok(user));
			const result = await service.getMe(1);
			expect(result).toBe(user);
		});
	});

	describe('updateUser', () => {
		it('should throw if user not found', async () => {
			userRepository.findById.mockResolvedValueOnce(
				Result.NotFound('User not found'),
			);
			await expect(service.updateUser(1, {})).rejects.toThrow(
				NotFoundException,
			);
		});

		it('should update and return user', async () => {
			const user = {
				id: 10,
				name: 'old name',
				hash: 'newhashed',
				createdAt: new Date(),
				updatedAt: new Date(),
				person: {
					id: 10,
					name: 'Old Name',
					documentNumber: '11111111111',
					birthDate: new Date('1990-01-01'),
					email: 'old@example.com',
					personType: PersonType.Individual,
					status: Status.Active,
				},
				personId: 10,
			} as UserWithPerson;

			userRepository.findById.mockResolvedValueOnce(Result.Ok(user));
			userRepository.update.mockResolvedValueOnce(Result.Ok(user));

			const dto: UpdateUserDto = {
				name: 'New Name',
				email: 'new@example.com',
				hash: 'newpass',
			};

			(bcrypt.hash as jest.Mock).mockResolvedValue('newhashed');

			const result = await service.updateUser(1, dto);
			const value = result.getValue()!;

			expect(value).toBeDefined();
			expect(value.hash).toBe('newhashed');
		});
	});

	describe('deleteUser', () => {
		it('should throw if user not found', async () => {
			userRepository.findById.mockResolvedValueOnce(
				Result.NotFound('User not found'),
			);
			await expect(service.deleteUser(1)).rejects.toThrow(NotFoundException);
		});

		it('should delete user if exists', async () => {
			const user = {
				id: 1,
				name: 'old name',
				hash: 'newhashed',
				createdAt: new Date(),
				updatedAt: new Date(),
				person: {
					id: 10,
					name: 'Old Name',
					documentNumber: '11111111111',
					birthDate: new Date('1990-01-01'),
					email: 'old@example.com',
					personType: PersonType.Individual,
					status: Status.Active,
				},
				personId: 10,
			} as UserWithPerson;

			userRepository.findById.mockResolvedValueOnce(Result.Ok(user));

			await service.deleteUser(1);

			expect(userRepository.delete).toHaveBeenCalledWith(1);
		});
	});
});
