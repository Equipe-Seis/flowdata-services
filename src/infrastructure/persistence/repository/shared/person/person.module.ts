import { Module } from '@nestjs/common';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import { PersonRepository } from './person.repository';

@Module({
    providers: [PersonRepository, PrismaService],
    exports: [PersonRepository], // Certifique-se de exportar o PersonRepository
})
export class PersonModule { }