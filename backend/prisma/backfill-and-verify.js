const prisma = require('../src/config/prisma');

async function runBackfillAndVerify() {
    console.log('🔄 Running CampusConnect Backfill & Database Integrity Check...');

    // 1. Backfill Users' Affiliation Status
    const users = await prisma.user.findMany();
    console.log(`Checking ${users.length} users for institutional affiliation...`);

    let updatedUsers = 0;
    for (const user of users) {
        let newAffiliation = user.affiliationStatus;

        // Admins and Organizers are internal college staff/leaders
        if (user.role === 'ADMIN' || user.role === 'ORGANIZER') {
            newAffiliation = 'INTERNAL_VERIFIED';
        } else if (!user.affiliationStatus || user.affiliationStatus === 'UNVERIFIED') {
            const email = (user.email || '').toLowerCase();
            const college = (user.collegeName || '').toLowerCase().trim();

            if (email.endsWith('.edu') || email.endsWith('.ac.in') || email.includes('@campusconnect.')) {
                newAffiliation = 'INTERNAL_VERIFIED';
            } else if (college && college !== 'our college' && college !== 'psg' && college !== '') {
                newAffiliation = 'EXTERNAL';
            } else if (user.rollNumber && user.department) {
                // Internal student credential provided
                newAffiliation = 'INTERNAL_VERIFIED';
            }
        }

        if (newAffiliation !== user.affiliationStatus) {
            await prisma.user.update({
                where: { id: user.id },
                data: { affiliationStatus: newAffiliation }
            });
            updatedUsers++;
        }
    }
    console.log(`✅ User affiliation check complete. ${updatedUsers} users updated.`);

    // 2. Backfill Events without OrganizerEntity or EventType
    const events = await prisma.event.findMany({
        include: { organizerEntity: true }
    });
    console.log(`Checking ${events.length} events for official organizing entity links...`);

    const allEntities = await prisma.organizerEntity.findMany();
    let updatedEvents = 0;
    let eventsNeedingReview = [];

    for (const event of events) {
        let updateData = {};

        if (!event.eventType) {
            updateData.eventType = 'INTRA_COLLEGE';
        }

        if (!event.organizerEntityId && event.department) {
            // Find matching entity by name
            const matched = allEntities.find(e => 
                e.name.toLowerCase() === event.department.toLowerCase() ||
                e.name.toLowerCase().includes(event.department.toLowerCase())
            );

            if (matched) {
                updateData.organizerEntityId = matched.id;
                updateData.department = matched.name;
            } else {
                eventsNeedingReview.push({ id: event.id, title: event.title, department: event.department });
            }
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.event.update({
                where: { id: event.id },
                data: updateData
            });
            updatedEvents++;
        }
    }

    console.log(`✅ Event backfill complete. ${updatedEvents} events updated.`);
    if (eventsNeedingReview.length > 0) {
        console.warn(`⚠️ The following ${eventsNeedingReview.length} legacy events lack a direct entity match and require administrator review:`);
        console.table(eventsNeedingReview);
    } else {
        console.log('✅ All events have valid organization links or verified status.');
    }
}

runBackfillAndVerify()
    .then(() => {
        console.log('🎉 Backfill & Integrity Check Finished Successfully.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Backfill error:', err);
        process.exit(1);
    });
