//test\users.e2e-spec.ts
//npm run test:e2e
//npm run test:e2e -- --testPathPatterns=users.e2e-spec.ts
// test/users.e2e-spec.ts
// test/users.e2e-spec.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaClient } from '@prisma/client';
import { seedUsers } from '@prisma/seeds/seed-users';

describe('UsersController (e2e)', () => {
    let app: INestApplication;
    const prisma = new PrismaClient();

    beforeAll(async () => {
        // Inicializa o app Nest
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        // Limpa as tabelas antes de rodar os testes
        await prisma.user.deleteMany();
        await prisma.person.deleteMany();

        // Roda a seed para popular o banco antes dos testes
        await seedUsers();
    });

    afterAll(async () => {
        // Fecha app e desconecta do banco
        await app.close();
        await prisma.$disconnect();
    });

    it('/users (GET) - should return seeded users', async () => {
        return request(app.getHttpServer())
            .get('/users')
            .expect(200)
            .then(({ body }) => {
                expect(body).toBeInstanceOf(Array);
                expect(body.length).toBeGreaterThan(0);
                expect(body[0]).toHaveProperty('person');
                expect(body[0].person.name).toBe('Seeded User'); // Nome esperado pela seed
            });
    });

    it('/users (POST) - should create a new user', async () => {
        const newUser = {
            person: {
                name: 'Jane Doe',
                email: 'jane@example.com',
                documentNumber: '12345678901',
                birthDate: '1990-01-01',
                status: 'active',
                personType: 'individual',
            },
            password: 'strongpassword', // Senha do usuário
        };

        return request(app.getHttpServer())
            .post('/users')
            .send(newUser)
            .expect(201)
            .then(({ body }) => {
                expect(body).toHaveProperty('id');
                expect(body.person.name).toBe('Jane Doe');
            });
    });

    // Outros testes e2e aqui
});
