

import { SetMetadata } from '@nestjs/common';

import { IS_PUBLIC_KEY } from '@/domain/shared/constants/metadata-keys';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);