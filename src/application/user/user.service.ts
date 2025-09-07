import {
	Inject,
	Injectable,
} from '@nestjs/common';

import * as argon from 'argon2';

import { PersonType, Status, User } from '@prisma/client';

import { CreateUserDto } from '@application/user/dto/create-user.dto';
import { UpdateUserDto } from '@application/user/dto/update-user.dto';
import { IUserRepository } from '@application/user/persistence/iuser.repository';
import { IPersonRepository } from '@application/auth/persistence/iperson.repository';
import { Result } from '@domain/shared/result/result.pattern';
import { UserModel } from '@domain/user/models/user.model';
import { UserWithPerson } from '@domain/user/types/userPerson.type';

@Injectable()
export class UserService {
	constructor(
		@Inject(IUserRepository) private userRepository: IUserRepository,
		@Inject(IPersonRepository) private personRepository: IPersonRepository,
	) {}

	async createUser(dto: CreateUserDto): Promise<Result<User>> {
		const personDto = dto.person;

		const existingByDocument = await this.personRepository.findByDocumentNumber(
			personDto.documentNumber,
		);

		if (existingByDocument.isFailure) {
			return Result.Fail(existingByDocument.getError());
		}

		if (existingByDocument.getValue() != null) {
			return Result.Forbidden('Document number is already in use.');
		}

		if (!personDto.email) {
			return Result.BadRequest('Email is required.');
		}

		const existingByEmail = await this.personRepository.findByEmail(
			personDto.email,
		);

		if (existingByEmail.isFailure) {
			return Result.Fail(existingByEmail.getError());
		}

		if (existingByEmail.getValue() != null) {
			return Result.Forbidden('Email is already in use.');
		}

		const personResult = await this.personRepository.create({
			name: personDto.name,
			documentNumber: personDto.documentNumber,
			birthDate: personDto.birthDate ? new Date(personDto.birthDate) : null,
			personType: PersonType.individual,
			status: Status.active,
			email: personDto.email,
		});

		if (personResult.isFailure) {
			return Result.Fail(personResult.getError());
		}

		const passwordHash = await argon.hash(dto.password, { hashLength: 10 });

		const person = personResult.getValue()!;

		const user = new UserModel(person, passwordHash);

		const result = await this.userRepository.create(user, person.id);

		if (result.isFailure) {
			return Result.Fail(result.getError());
		}

		return result;
	}

	async getMe(userId: number): Promise<Result<User | null>> {
		const result = await this.userRepository.findById(userId);

		if (result.isFailure) {
			return result;
		}

		if (result.getValue() == null) {
			return Result.NotFound('User not found.');
		}

		return result;
	}

	async findByEmail(email: string): Promise<Result<User | null>> {
		const result = await this.userRepository.findByEmail(email);

		if (result.isFailure) {
			return result;
		}

		if (result.getValue() == null) {
			return Result.NotFound('User not found.');
		}

		return result;
	}

	async findById(id: number): Promise<Result<UserWithPerson | null>> {
		const result = await this.userRepository.findById(id);

		if (result.isFailure) {
			return result;
		}

		if (result.getValue() == null) {
			return Result.NotFound('User not found.');
		}

		return result;
	}

	async updateUser(
		id: number,
		dto: UpdateUserDto,
	): Promise<Result<User | null>> {
		const result = await this.findById(id);

		if (result.isFailure) {
			return result;
		}

		const user = result.getValue()!;

		if (dto.hash) {
			user.hash = await argon.hash(dto.hash, { hashLength: 10 });
		}

		if (dto.name) user.person.name = dto.name;
		if (dto.personType) user.person.personType = dto.personType;
		if (dto.documentNumber) user.person.documentNumber = dto.documentNumber;
		if (dto.birthDate) user.person.birthDate = new Date(dto.birthDate);
		if (dto.status) user.person.status = dto.status;
		if (dto.email) user.person.email = dto.email;

		return await this.userRepository.update(user.id, user);
	}

	async deleteUser(id: number): Promise<Result<unknown>> {
		const result = await this.userRepository.findById(id);

		if (result.isFailure) {
			return result;
		}

		if (!result.value) {
			return Result.NotFound();
		}

		await this.userRepository.delete(result.value.id);

		return Result.Ok(`Usuario ${id} deletado com successo.`);
	}
}
