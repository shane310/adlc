import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

describe('GET /api/v1/health (e2e)', () => {
  let app: INestApplication;
  const mockPrisma = {
    onModuleInit: async (): Promise<void> => {},
    onModuleDestroy: async (): Promise<void> => {},
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleRef.createNestApplication();
    const config = app.get(ConfigService);
    app.setGlobalPrefix('api/v1');
    app.enableCors({
      origin: config.get<string>('FRONTEND_URL', 'http://localhost:5173'),
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns JSON envelope with status ok and ISO timestamp', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toMatchObject({
      success: true,
      data: { status: 'ok' },
    });
    const ts: unknown = (res.body as { data?: { timestamp?: unknown } }).data
      ?.timestamp;
    expect(typeof ts).toBe('string');
    expect(new Date(String(ts)).toISOString()).toBe(ts);
  });
});
