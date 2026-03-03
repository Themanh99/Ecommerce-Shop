import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Security
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());

  // CORS - allow frontend dev
  app.enableCors({
    origin: config.get('FRONTEND_URL', 'http://localhost:5173'),
    credentials: true, // REQUIRED for HttpOnly cookie cross-origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // Global validation pipe (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // Strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global API prefix
  app.setGlobalPrefix('api');

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}/api`);
}
bootstrap();
