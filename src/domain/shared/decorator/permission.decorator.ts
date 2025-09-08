import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Define permissões necessárias para acessar a rota.
 * Exemplo: @HasPermission('create_user', 'read_user')
 */
export const HasPermission = (...permissions: string[]) =>
    SetMetadata(PERMISSIONS_KEY, permissions);