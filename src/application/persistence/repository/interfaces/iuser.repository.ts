// src/application/persistence/repository/interfaces/iuser.repository.ts
import type { User } from 'src/domain/user/user.entity';

export abstract class IUserRepository {
  /**
   * Cria e salva um novo usuário
   * @param user entidade User pronta para persistir
   * @returns o usuário salvo
   */
  abstract create(user: User): Promise<User>;

  /**
   * Busca usuário pelo ID
   * @param id identificador do usuário
   * @returns usuário encontrado ou null
   */
  abstract findById(id: number): Promise<User | null>;

  /**
   * Busca usuário pelo email
   * @param email email do usuário
   * @returns usuário encontrado ou null
   */
  abstract findByEmail(email: string): Promise<User | null>;

  /**
   * Atualiza dados do usuário
   * @param user entidade User com dados atualizados
   * @returns usuário atualizado
   */
  abstract update(user: User): Promise<User>;

  /**
   * Remove usuário pelo ID
   * @param id identificador do usuário
   * @returns void
   */
  abstract delete(id: number): Promise<void>;
}
