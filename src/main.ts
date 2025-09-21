
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {

	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

	app.enableCors({
		origin: `http://localhost:3001`,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		allowedHeaders: 'Content-Type, Authorization',
		credentials: true,
	});

	const config = new DocumentBuilder()
		.setTitle('FlowData Services')
		.setDescription('Backend for flowdata')
		.setVersion('1.0')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				name: 'Authorization',
				description: 'Digite o token JWT aqui',
				in: 'header',
			},
			'JWT-auth',
		)
		.build();

	const document = SwaggerModule.createDocument(app, config);

	SwaggerModule.setup('api', app, document);

	await app.listen(process.env.PORT ?? 3333);
}

bootstrap();
