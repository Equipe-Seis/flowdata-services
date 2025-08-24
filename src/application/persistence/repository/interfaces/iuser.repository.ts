import { User } from 'generated/prisma';

export interface IUserRepository {
  create(email: string, hash: string): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export const IUserRepository = Symbol('IUserRepository');