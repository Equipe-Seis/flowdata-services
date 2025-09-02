import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@flowdata.com';
    const documentNumber = '1234567890';
    const passwordHash = await argon.hash('2025@flow');

    // Verifica se já existe uma pessoa com o mesmo email ou documento
    const existingPerson = await prisma.person.findFirst({
        where: {
            OR: [
                { email },
                { documentNumber },
            ],
        },
    });

    let personId: number;

    if (!existingPerson) {
        // Se não existe, cria a pessoa
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
        // Caso a pessoa já exista, apenas usa o ID da pessoa existente
        console.log('Pessoa já existe, utilizando a existente...');
        personId = existingPerson.id;
    }

    // Verifica se já existe um usuário associado a essa pessoa
    const existingUser = await prisma.user.findFirst({
        where: {
            personId: personId,
        },
    });

    if (existingUser) {
        console.log('Usuário admin já existe');
        return;
    }

    // Cria o usuário associado à pessoa
    await prisma.user.create({
        data: {
            personId: personId,
            hash: passwordHash,
        },
    });

    console.log('Usuário admin criado com sucesso');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
