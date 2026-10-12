const prisma = require('../config/prisma');

const checkHealth = async (req, res, next) => {
    try {
        // Quick ping to MySQL to ensure database is responsive
        await prisma.$queryRaw`SELECT 1`;
        
        res.status(200).json({
            success: true,
            status: 'ok',
            message: 'CampusConnect API is running smoothly.',
            database: 'connected',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'error',
            message: 'API is running, but database connection failed.',
            database: 'disconnected',
            error: error.message
        });
    }
};

module.exports = {
    checkHealth
};
