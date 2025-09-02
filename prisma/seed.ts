import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeds/seed-users';
//import { seedPermissions } from './seeds/seed-permissions';
//import { seedProfiles } from './seeds/seed-profiles';

const prisma = new PrismaClient();

async function main() {
    await seedUsers();
    //await seedPermissions();
    //await seedProfiles();

    console.log('Seeding complete');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
