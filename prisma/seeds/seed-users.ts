import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedUsers() {
	try {
		await prisma.user.create({
			data: {
				hash: 'hashedpassword',
				person: {
					create: {
						name: 'Admin User',
						email: 'admin@example.com',
						documentNumber: '00000000000',
						personType: 'individual',
						status: 'active',
					},
				},
			},
		});

		console.log('Users seeded successfully!');
	} catch (error) {
		console.error('Error seeding users:', error);
	} finally {
		await prisma.$disconnect();
	}
}
