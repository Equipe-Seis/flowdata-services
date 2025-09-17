import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const roles = [
        { name: 'admin', description: 'Administrator profile with all permissions' },
        { name: 'supply_supervisor', description: 'Supply Supervisor profile' },
        { name: 'supply_stock_keeper', description: 'Supply Stock Keeper profile' },
        { name: 'production_planner', description: 'Production Planner profile' },
        { name: 'buyer', description: 'Buyer profile' },
    ];

    for (const role of roles) {
        await prisma.profile.upsert({
            where: { name: role.name },
            update: {},
            create: role,
        });
    }

    const operations = ['create', 'read', 'update', 'delete'];
    const entities = ['user', 'supplier', 'supply_item', 'product'];

    const permissionNames = entities.flatMap((ent) =>
        operations.map((op) => `${op}_${ent}`),
    );

    for (const perm of permissionNames) {
        await prisma.permission.upsert({
            where: { name: perm },
            update: {},
            create: { name: perm, description: `Permission to ${perm.replace('_', ' ')}` },
        });
    }

    const rolePermissionsMap: Record<string, string[]> = {
        admin: permissionNames,
        supply_supervisor: permissionNames.filter((p) =>
            p.includes('supplier') || p.includes('supply_item'),
        ),
        supply_stock_keeper: permissionNames.filter((p) =>
            p.startsWith('read_supplier') || p.startsWith('read_supply_item'),
        ),
        production_planner: permissionNames.filter((p) =>
            p.startsWith('read_product') || p.startsWith('update_product'),
        ),
        buyer: permissionNames.filter((p) =>
            p.startsWith('read_supplier') ||
            p.startsWith('create_supply_item') ||
            p.startsWith('read_supply_item'),
        ),
    };

    for (const [roleName, perms] of Object.entries(rolePermissionsMap)) {
        const profile = await prisma.profile.findUniqueOrThrow({
            where: { name: roleName },
        });
        for (const permName of perms) {
            const permission = await prisma.permission.findUniqueOrThrow({
                where: { name: permName },
            });
            await prisma.profilePermission.upsert({
                where: {
                    profileId_permissionId: {
                        profileId: profile.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    profileId: profile.id,
                    permissionId: permission.id,
                },
            });
        }
    }


    const email = 'admin@flowdata.com';
    const documentNumber = '1234567890';

    const person = await prisma.person.findFirst({
        where: {
            OR: [
                { email: email },
                { documentNumber: documentNumber },
            ],
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

main()
    .then(async () => {
        console.log('Seed finalizado com sucesso.');
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('Erro na seed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
