import { SetMetadata } from '@nestjs/common';
import { PROFILES_KEY } from '@/domain/shared/constants/metadata-keys';
/**
 * Define perfis necessários para acessar a rota.
 * Exemplo: @HasProfile('admin', 'buyer')
 */
export const HasProfile = (...profiles: string[]) =>
    SetMetadata(PROFILES_KEY, profiles);
