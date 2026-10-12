const { PrismaClient } = require('@prisma/client');

let prisma;
if (process.env.NODE_ENV === 'test') {
    prisma = require('../../tests/prismaMockObject.js');
} else {
    prisma = new PrismaClient();
}

module.exports = prisma;
