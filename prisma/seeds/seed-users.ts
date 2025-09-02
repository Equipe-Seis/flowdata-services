//prisma\seeds\seed-users.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedUsers() {
    try {
        // Criação de um usuário com uma pessoa associada
        await prisma.user.create({
            data: {
                hash: 'hashedpassword', // Pode ser um hash real em um ambiente de produção
                person: {
                    create: {
                        name: 'Admin User',
                        email: 'admin@example.com',
                        documentNumber: '00000000000',
                        personType: 'individual',  // Aqui você está utilizando o enum PersonType
                        status: 'active', // E também Status
                    },
                },
            },
        });

        console.log('Users seeded successfully!');
    } catch (error) {
        console.error('Error seeding users:', error);
    } finally {
        // Sempre desconnectar do banco para evitar conexões abertas
        await prisma.$disconnect();
    }
}
