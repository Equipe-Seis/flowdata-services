// src/application/persistence/repository/interfaces/iuser.repository.ts
import type { User } from '@domain/user/user.entity';
import { Result } from '@domain/shared/result/result.pattern'; // Certifique-se de importar o Result

export abstract class IUserRepository {
  /**
   * Cria e salva um novo usuário
   * @param user entidade User pronta para persistir
   * @returns Result<User> - Resultado da operação, com sucesso ou falha
   */
  abstract create(user: User): Promise<Result<User>>;

  /**
   * Busca usuário pelo ID
   * @param id identificador do usuário
   * @returns Result<User> - Resultado da operação, com usuário ou erro
   */
  abstract findById(id: number): Promise<Result<User>>;

  /**
   * Busca usuário pelo email
   * @param email email do usuário
   * @returns Result<User> - Resultado da operação, com usuário ou erro
   */
  abstract findByEmail(email: string): Promise<Result<User>>;

  /**
   * Atualiza dados do usuário
   * @param user entidade User com dados atualizados
   * @returns Result<User> - Resultado da operação, com sucesso ou falha
   */
  abstract update(user: User): Promise<Result<User>>;

  /**
   * Remove usuário pelo ID
   * @param id identificador do usuário
   * @returns Result<void> - Resultado da operação, com sucesso ou falha
   */
  abstract delete(id: number): Promise<Result<void>>;
}
