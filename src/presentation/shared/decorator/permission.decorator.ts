import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from '@/domain/shared/constants/metadata-keys';
/**
 * Define permissões necessárias para acessar a rota.
 * Exemplo: @HasPermission('create_user', 'read_user')
 */
export const HasPermission = (...permissions: string[]) =>
    SetMetadata(PERMISSIONS_KEY, permissions);