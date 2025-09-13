
import { Result } from '@domain/shared/result/result.pattern';
import { UserWithPerson } from '@domain/user/types/userPerson.type';
import { UserModel } from '@domain/user/models/user.model';
import { Person, User } from '@prisma/client';

export interface IUserRepository {

	findAll(): Promise<UserWithPerson[]>;
	/**
	 * Cria e salva um novo usuário
	 * @param email email do usuário
	 * @param hash hash de senha do usuario
	 * @returns Result<User> - Resultado da operação, com sucesso ou falha
	 */
	create(user: UserModel, personId: number): Promise<Result<User>>;

	/**
	 * Busca usuário pelo ID
	 * @param id identificador do usuário
	 * @returns Result<User> - Resultado da operação, com usuário ou erro
	 */
	findById(id: number): Promise<Result<UserWithPerson | null>>;

	/**
	 * Busca usuário pelo email
	 * @param email email do usuário
	 * @returns Result<User> - Resultado da operação, com usuário ou erro
	 */
	findByEmail(email: string): Promise<Result<UserWithPerson | null>>;


	/**
	 * Busca usuário pelo numero do documento
	 * @param documentNumber numero do documento do usuário
	 * @returns Result<User> - Resultado da operação, com usuário ou erro
	 */
	findByDocumentNumber(documentNumber: string): Promise<Result<UserWithPerson | null>>;


	/**
	 * Atualiza dados do usuário
	 * @param user entidade User com dados atualizados
	 * @returns Result<UserWithPerson | null> - Resultado da operação, com sucesso ou falha
	 */
	update(id: number, user: UserModel): Promise<Result<UserWithPerson | null>>;

	/**
	 * Remove usuário pelo ID
	 * @param id identificador do usuário
	 * @returns Result<void> - Resultado da operação, com sucesso ou falha
	 */
	delete(id: number): Promise<Result<void>>;


	findUserWithProfiles(userId: number): Promise<UserWithPerson | null>

}

export const IUserRepository = Symbol('IUserRepository');
