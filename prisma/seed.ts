import { PrismaClient } from '@prisma/client';

import { seedAdminUser } from './seeds/seed-create-user-admin';
import { seedRolesAndPermissions } from './seeds/seed-roles-permitions';
import { seedUserProfiles } from './seeds/seed-user_admin-roles-permissions';
import { seedSuppliersAndSupplyItems } from './seeds/seed-supplier-and-supply';

const prisma = new PrismaClient();

async function main() {
	await seedAdminUser(prisma);
	await seedRolesAndPermissions(prisma);
	await seedUserProfiles(prisma);
	await seedSuppliersAndSupplyItems(prisma);
	console.log('Seeding complete ✅');
}

main()
    .catch((e) => {
        console.error('Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });