const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('${')) {
  const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
  const dbPort = DB_PORT || '3306';
  const encodedPassword = encodeURIComponent(DB_PASSWORD);
  process.env.DATABASE_URL = `mysql://${DB_USER}:${encodedPassword}@${DB_HOST}:${dbPort}/${DB_NAME}`;
}

const prisma = new PrismaClient();

module.exports = prisma;
