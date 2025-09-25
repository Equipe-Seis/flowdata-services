import { PrismaClient } from '@prisma/client';

export async function seedUserProfiles(prisma: PrismaClient) {
    const email = 'admin@flowdata.com';
    const documentNumber = '1234567890';

    const person = await prisma.person.findFirst({
        where: {
            OR: [{ email }, { documentNumber }],
        },
        include: {
            User: true,
        },
    });

    if (!person) {
        throw new Error('Pessoa não encontrada com email ou documentNumber fornecido.');
    }

    if (!person.User) {
        throw new Error('Usuário não encontrado para a pessoa especificada.');
    }

    const userId = person.User.id;

    const adminProfile = await prisma.profile.findUniqueOrThrow({
        where: { name: 'admin' },
    });

    const existingUserProfile = await prisma.userProfile.findFirst({
        where: {
            userId,
            profileId: adminProfile.id,
        },
    });

    if (!existingUserProfile) {
        await prisma.userProfile.create({
            data: {
                userId,
                profileId: adminProfile.id,
            },
        });
        console.log('Perfil admin atribuído ao usuário com sucesso.');
    } else {
        console.log('Usuário já possui o perfil admin.');
    }
}