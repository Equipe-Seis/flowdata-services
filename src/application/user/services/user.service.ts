import {
	Inject,
	Injectable,
} from '@nestjs/common';

import * as argon from 'argon2';

import { User } from '@prisma/client';

import { CreateUserDto } from '@application/user/dto/create-user.dto';
import { UpdateUserDto } from '@application/user/dto/update-user.dto';
import { IUserRepository } from '@application/user/persistence/iuser.repository';
import { IPersonRepository } from '@application/person/persistence/iperson.repository';
import { Result } from '@domain/shared/result/result.pattern';
import { UserModel } from '@domain/user/models/user.model';
import { ProfileModel } from '@domain/profile/models/profile.model';
import { UserWithPerson } from '@domain/user/types/userPerson.type';
import { IUserCache } from '@application/user/cache/iuser.cache';
import { UserMapper } from '@application/user/mappers/user.mapper';
import { UserAccessService } from '@application/user/services/user-access.service';
import { IProfileRepository } from '@application/profile/persistence/iprofile.repository';
import { PersonMapper } from '@application/person/mappers/person.mapper';

@Injectable()
export class UserService {
	constructor(
		@Inject(IUserRepository) private userRepository: IUserRepository,
		@Inject(IPersonRepository) private personRepository: IPersonRepository,
		@Inject(IProfileRepository) private profileRepository: IProfileRepository,
		@Inject(IUserCache) private readonly userCache: IUserCache,
		private readonly userAccessService: UserAccessService,
	) {}

	async getAllUsers(page: number, limit: number) {
		return this.userRepository.findAll(page, limit);
	}

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

		if (dto.profiles && dto.profiles.length > 0) {
			const validProfilesCount = await this.profileRepository.countByIds(
				dto.profiles,
			);

			if (validProfilesCount !== dto.profiles.length) {
				return Result.BadRequest('One or more profiles are invalid.');
			}
		}

		const personData = PersonMapper.fromDto(personDto);
		const personResult = await this.personRepository.create(personData);

		if (personResult.isFailure) {
			return Result.Fail(personResult.getError());
		}

		const passwordHash = await argon.hash(dto.password, { hashLength: 10 });

		const person = personResult.getValue()!;
		const profileModels = (dto.profiles || []).map(
			(id) => ({ id }) as ProfileModel,
		);
		const user = new UserModel(person, passwordHash, profileModels);

		if (!person.id) {
			return Result.BadRequest('Person ID is required for user creation.');
		}

		const result = await this.userRepository.create(user, person.id);

		if (result.isFailure) {
			return Result.Fail(result.getError());
		}

		return result;
	}

	async getMe(userId: number): Promise<Result<UserWithPerson | null>> {
		if (!userId || typeof userId !== 'number') {
			return Result.BadRequest('Invalid user ID.');
		}

		const result = await this.userRepository.findById(userId);

		if (result.isFailure) {
			return result;
		}

		if (result.getValue() == null) {
			return Result.NotFound('User not found.');
		}

		return result;
	}

	async findByEmail(email: string): Promise<Result<UserWithPerson | null>> {
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
	): Promise<Result<UserWithPerson | null>> {
		const result = await this.userRepository.findById(id);

		if (result.isFailure) {
			return result;
		}

		const userPrisma = result.getValue()!;
		const user = UserMapper.toDomain(userPrisma);

		if (
			dto.documentNumber &&
			dto.documentNumber !== user.person.documentNumber
		) {
			const existingPersonResult =
				await this.personRepository.findByDocumentNumber(dto.documentNumber);

			if (existingPersonResult.isFailure) {
				return Result.BadRequest(existingPersonResult.getError());
			}

			const existingPerson = existingPersonResult.getValue();

			if (existingPerson && existingPerson.id !== user.person.id) {
				return Result.BadRequest('Document number is already in use.');
			}
		}

		if (dto.email && dto.email !== user.person.email) {
			const existingEmailResult = await this.personRepository.findByEmail(
				dto.email,
			);

			if (existingEmailResult.isFailure) {
				return Result.BadRequest(existingEmailResult.getError());
			}

			const existingEmail = existingEmailResult.getValue();

			if (existingEmail && existingEmail.id !== user.person.id) {
				return Result.BadRequest('Email is already in use.');
			}
		}

		if (dto.profiles && dto.profiles.length > 0) {
			const validProfilesCount = await this.profileRepository.countByIds(
				dto.profiles,
			);

			if (validProfilesCount !== dto.profiles.length) {
				return Result.BadRequest('One or more profiles are invalid.');
			}
		}

		if (dto.hash) {
			user.hash = await argon.hash(dto.hash, { hashLength: 10 });
		}

		if (dto.name) user.person.name = dto.name;
		if (dto.personType) user.person.personType = dto.personType;
		if (dto.documentNumber) user.person.documentNumber = dto.documentNumber;
		if (dto.birthDate) user.person.birthDate = new Date(dto.birthDate);
		if (dto.status) user.person.status = dto.status;
		if (dto.email) user.person.email = dto.email;

		let shouldUpdatePermissionsCache = false;
		if (dto.profiles) {
			const newProfiles = [...dto.profiles].sort();
			const currentProfiles = [...user.profiles.map((p) => p.id)].sort(); // compara por ID apenas

			const profilesChanged =
				JSON.stringify(newProfiles) !== JSON.stringify(currentProfiles);

			if (profilesChanged) {
				user.profiles = dto.profiles.map(
					(id) => new ProfileModel(id, '', '', []),
				);
				shouldUpdatePermissionsCache = true;
			}
		}

		const updateResult = await this.userRepository.update(id, user);

		if (updateResult.isSuccess && shouldUpdatePermissionsCache) {
			await this.userAccessService.updateUserPermissionsCache(id);
		}

		return updateResult;
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
		await this.userCache.clearUserCache(id);

		return Result.Ok(`User ${id} deleted successfully.`);
	}
}
