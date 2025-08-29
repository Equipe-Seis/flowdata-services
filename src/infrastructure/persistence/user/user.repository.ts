import {
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { User } from 'generated/prisma';
import { IUserRepository } from 'src/application/auth/repository/iuser.repository';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';

@Injectable({})
export class UserRepository implements IUserRepository {
	constructor(private prismaService: PrismaService) {}

	async findById(id: number): Promise<User | null> {
		return await this.prismaService.user.findUnique({
			where: {
				id: id,
			},
		});
	}

	async findByEmail(email: string): Promise<User | null> {
		return await this.prismaService.user.findUnique({
			where: {
				email: email,
			},
		});
	}

	async create(email: string, hash: string): Promise<User> {
		try {
			const user = await this.prismaService.user.create({
				data: {
					email: email,
					hash,
				},
			});

			return user;
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code == 'P2002'
			) {
				throw new ForbiddenException(
					'Credentials are taken',
				);
			}
			throw new Error(error);
		}
	}
}
