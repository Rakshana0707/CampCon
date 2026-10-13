require('dotenv').config();
const app = require('./app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Validate required environment variables
        const requiredEnvs = ['DATABASE_URL', 'JWT_SECRET'];
        const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
        
        if (missingEnvs.length > 0) {
            console.error('CRITICAL: Missing required environment variables:', missingEnvs.join(', '));
            process.exit(1);
        }

        // Verify database connection before starting the server
        await prisma.$connect();
        console.log('✅ Connected to MySQL database via Prisma');

        // Automatically seed demo events and organizers if database is empty
        try {
            const { autoSeedIfEmpty } = require('../prisma/seedAll');
            await autoSeedIfEmpty();
        } catch (seedErr) {
            console.warn('⚠️ Auto-seed check notice:', seedErr.message);
        }

        app.listen(PORT, () => {
            console.log(`🚀 CampusConnect Backend running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to connect to the database:', error.message);
        process.exit(1);
    }
}

startServer();
