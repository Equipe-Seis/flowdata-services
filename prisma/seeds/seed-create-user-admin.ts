

import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function main() {
	const email = 'admin@flowdata.com';
	const documentNumber = '1234567890';
	const passwordHash = await argon.hash('2025@flow');

	const existingPerson = await prisma.person.findFirst({
		where: {
			OR: [{ email }, { documentNumber }],
		},
	});

	let personId: number;

	if (!existingPerson) {
		console.log('Criando nova pessoa...');
		const newPerson = await prisma.person.create({
			data: {
				name: 'Admin User',
				documentNumber: documentNumber,
				email: email,
				personType: 'individual',
				status: 'active',
			},
		});

		personId = newPerson.id;
		console.log('Pessoa criada');
	} else {
		console.log('Pessoa já existe, utilizando a existente...');
		personId = existingPerson.id;
	}

	const existingUser = await prisma.user.findFirst({
		where: {
			personId: personId,
		},
	});

	if (existingUser) {
		console.log('Usuário admin já existe');
		return;
	}

	await prisma.user.create({
		data: {
			personId: personId,
			hash: passwordHash,
		},
	});

	console.log('Usuário admin criado com sucesso');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
