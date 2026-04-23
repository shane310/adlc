import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

describe('AppModule', () => {
  it('compiles', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        onModuleInit: async (): Promise<void> => {},
        onModuleDestroy: async (): Promise<void> => {},
      })
      .compile();

    expect(moduleRef).toBeDefined();
    await moduleRef.close();
  });
});
