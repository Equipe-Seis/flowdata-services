export interface IUserCache {
    /**
     * Salva as permissões de um usuário no cache Redis
     * @param userId Id do usuário
     * @param permissions Lista de permissões (strings)
     */
    setPermissions(userId: number, permissions: string[], ttlSeconds?: number): Promise<void>;

    /**
     * Busca as permissões de um usuário no cache Redis
     * @param userId Id do usuário
     * @returns Lista de permissões ou null se não existir
     */
    getPermissions(userId: number): Promise<string[] | null>;

    /**
     * Salva os perfis de um usuário no cache Redis
     * @param userId Id do usuário
     * @param profiles Lista de perfis (strings)
     */
    setProfiles(userId: number, profiles: string[], ttlSeconds?: number): Promise<void>;

    /**
     * Busca os perfis de um usuário no cache Redis
     * @param userId Id do usuário
     * @returns Lista de perfis ou null se não existir
     */
    getProfiles(userId: number): Promise<string[] | null>;

    /**
     * Remove cache de permissões e perfis do usuário
     * @param userId Id do usuário
     */
    clear(userId: number): Promise<void>;
}

export const IUserCache = Symbol('IUserCache'); 
