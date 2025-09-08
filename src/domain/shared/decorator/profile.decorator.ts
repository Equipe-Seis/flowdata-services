import { SetMetadata } from '@nestjs/common';

export const PROFILES_KEY = 'profiles';

/**
 * Define perfis necessários para acessar a rota.
 * Exemplo: @HasProfile('admin', 'buyer')
 */
export const HasProfile = (...profiles: string[]) =>
    SetMetadata(PROFILES_KEY, profiles);
