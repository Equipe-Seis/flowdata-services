import { Module } from '@nestjs/common';
import { PrismaService } from './persistence/prisma/prisma.service';

@Module({
    providers: [PrismaService],
    exports: [PrismaService]
})
export class InfrastructureModule {}
