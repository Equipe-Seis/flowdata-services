import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // Dentro da função bootstrap, antes de criar o documento Swagger:
  const config = new DocumentBuilder()
    .setTitle('Minha API')
    .setDescription('API exemplo com JWT')
    .setVersion('1.0')
    .addBearerAuth( // <-- aqui configura o auth JWT
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Digite o token JWT aqui',
        in: 'header',
      },
      'JWT-auth', // nome do security scheme, pode ser qualquer string
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Passa o documento pro SwaggerModule
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3333);
}

bootstrap();
