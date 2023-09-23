/* eslint-disable no-console */
// noinspection ES6PreferShortImport
import { PrismaClient } from '@prisma/client';
import { values } from 'lodash';
import { UserSeed } from './user.seed';
import { EnvironmentEnum } from '../../src/config/environment.enum';

// https://www.prisma.io/docs/guides/migrate/seed-database#how-to-seed-your-database-in-prisma

const prisma = new PrismaClient();

async function main() {
  if (!process.env.MODE || !values(EnvironmentEnum).includes(process.env.MODE as EnvironmentEnum)) {
    throw new Error(`MODE must be one of ${values(EnvironmentEnum).join(', ')}`);
  }
  console.log(`Seeding for ${(process.env.MODE).toUpperCase()} environment...`);
  if (!process.env.DB_URL) {
    throw new Error('DATABASE_URL is not provided!');
  }
  await prisma.$transaction(async (transaction) => {
    await UserSeed(transaction);
  }, { maxWait: 100000, timeout: 100000 });
}

main()
  .catch(async (e) => {
    console.error((e as Error).message);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
