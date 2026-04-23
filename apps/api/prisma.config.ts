import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

loadEnv({ path: resolve(__dirname, '.env') });
loadEnv({ path: resolve(__dirname, '.env.local') });

const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://zhimao:localdevpassword@127.0.0.1:5432/zhimao_dev';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});
