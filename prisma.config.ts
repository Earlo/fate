import { defineConfig } from 'prisma/config';

// Fallback placeholder lets `prisma generate` run without a live DB.
const url =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/postgres';

export default defineConfig({
  schema: './prisma/schema.prisma',
  // Prisma 7 config uses the singular `datasource`
  datasource: {
    url,
  },
});
