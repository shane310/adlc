import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: config.get<string>('FRONTEND_URL', 'http://localhost:5173'),
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ZhiMao API')
    .setDescription('智贸 AI 外贸工作台 API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const portRaw = config.get<string | number>('PORT', 3000);
  const port = typeof portRaw === 'number' ? portRaw : Number(portRaw) || 3000;
  await app.listen(port);
}

void bootstrap();
