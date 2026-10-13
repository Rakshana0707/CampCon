const { execSync } = require('child_process');
const path = require('path');
const prisma = require('../src/config/prisma');

async function autoSeedIfEmpty() {
    try {
        const eventCount = await prisma.event.count();
        if (eventCount === 0) {
            console.log('🌱 Database is empty (0 events). Running full automated initialization...');
            
            const prismaDir = __dirname;
            
            try {
                console.log('1/3 -> Seeding official departments & clubs...');
                execSync(`node "${path.join(prismaDir, 'seed-organizers.js')}"`, { stdio: 'inherit' });
            } catch (err) {
                console.warn('Organizer seed notice:', err.message);
            }

            try {
                console.log('2/3 -> Seeding standard accounts (admin, organizers, students)...');
                execSync(`node "${path.join(prismaDir, 'seed-users.js')}"`, { stdio: 'inherit' });
            } catch (err) {
                console.warn('User seed notice:', err.message);
            }

            try {
                console.log('3/3 -> Seeding events, symposiums & activities...');
                execSync(`node "${path.join(prismaDir, 'seed-events.js')}"`, { stdio: 'inherit' });
            } catch (err) {
                console.warn('Event seed notice:', err.message);
            }

            console.log('🎉 Full automated seeding complete! All events are ready.');
        } else {
            console.log(`ℹ️ Database already has ${eventCount} events. Skipping auto-seed.`);
        }
    } catch (error) {
        console.warn('⚠️ Auto-seed check notice:', error.message);
    }
}

module.exports = { autoSeedIfEmpty };
