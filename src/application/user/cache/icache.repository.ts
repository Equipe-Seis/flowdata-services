export interface ICacheRepository {
	/**
	 * Armazena um valor no cache associado a uma chave.
	 * @param key Chave única para identificar o item no cache.
	 * @param value Valor a ser armazenado.
	 * @param ttlSeconds Tempo de vida em segundos (opcional). 
	 */
	set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

	/**
	 * Recupera um valor do cache a partir da chave informada.
	 * @param key Chave do item armazenado.
	 * @returns O valor encontrado ou `null` caso não exista ou tenha expirado.
	 */
	get<T>(key: string): Promise<T | null>;

	/**
	 * Remove um item do cache.
	 * @param key Chave do item a ser removido.
	 */
	del(key: string): Promise<void>;
}

export const ICacheRepository = Symbol('ICacheRepository');
