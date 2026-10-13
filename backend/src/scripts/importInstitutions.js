/**
 * Repeatable, Production-Grade Importer for Official Tamil Nadu Colleges
 * Sourced from AICTE Official Dataset for Tamil Nadu
 * 
 * Features:
 * - Reads local versioned snapshot: backend/src/data/dataset/aicte_tamil_nadu_colleges.json
 * - Synchronizes all 38 official Tamil Nadu districts into District table
 * - Normalizes and verifies district mapping for every record
 * - Preserves existing host institution (CIT) with stable code 'TN-CBE-CIT'
 * - Deduplicates multi-programme registrations of the same college
 * - Safe idempotency: upserts by unique compound key [name, district, state]
 * - Preserves existing user and event registrations (no database reset)
 * - Emits comprehensive import report (imported, updated, skipped, unresolved)
 */

const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');
const { TN_OFFICIAL_DISTRICTS_38, resolveOfficialDistrict } = require('../data/tamilnadu.districts');

const DATASET_PATH = path.join(__dirname, '../data/dataset/aicte_tamil_nadu_colleges.json');
const DATASET_METADATA = {
    source: "All India Council for Technical Education (AICTE) - Ministry of Education, Government of India",
    datasetSnapshot: "aicte_tamil_nadu_colleges.json",
    retrievalDate: "2026-10-13",
    state: "Tamil Nadu",
    coverage: "All AICTE-approved engineering, technical, polytechnic, and affiliated institutions across Tamil Nadu"
};

/**
 * Standardize college names (remove excessive spaces, preserve title casing)
 */
function cleanInstitutionName(name) {
    if (!name) return '';
    return name
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/["']/g, "'");
}

async function importTamilNaduDirectory({ verbose = true } = {}) {
    const report = {
        source: DATASET_METADATA.source,
        retrievalDate: DATASET_METADATA.retrievalDate,
        districtsTotal: TN_OFFICIAL_DISTRICTS_38.length,
        districtsImported: 0,
        districtsUpdated: 0,
        totalSourceRecords: 0,
        validTamilNaduRecords: 0,
        uniqueInstitutionsParsed: 0,
        duplicatesCollapsed: 0,
        unresolvedRecords: 0,
        unresolvedDetails: [],
        dbInserted: 0,
        dbUpdated: 0,
        dbSkipped: 0,
        errors: []
    };

    if (verbose) {
        console.log('===============================================================');
        console.log('🚀 CampusConnect — Importing Official Tamil Nadu Institution Directory');
        console.log(`Source: ${DATASET_METADATA.source}`);
        console.log(`Snapshot Date: ${DATASET_METADATA.retrievalDate}`);
        console.log('===============================================================\n');
    }

    // 1. Synchronize Official 38 Districts in Database
    if (verbose) console.log('Step 1: Synchronizing 38 official Tamil Nadu districts into District table...');
    for (const districtName of TN_OFFICIAL_DISTRICTS_38) {
        try {
            const result = await prisma.district.upsert({
                where: { name: districtName },
                update: {
                    state: 'Tamil Nadu',
                    isActive: true
                },
                create: {
                    name: districtName,
                    state: 'Tamil Nadu',
                    isActive: true
                }
            });
            report.districtsImported++;
        } catch (err) {
            report.errors.push(`Failed to upsert district ${districtName}: ${err.message}`);
        }
    }
    if (verbose) console.log(`✓ Synchronized ${report.districtsImported} districts.\n`);

    // 2. Read dataset file
    if (!fs.existsSync(DATASET_PATH)) {
        throw new Error(`Official dataset file not found at ${DATASET_PATH}. Please verify the file exists.`);
    }

    const rawFileContent = fs.readFileSync(DATASET_PATH, 'utf8');
    const parsedData = JSON.parse(rawFileContent);
    const sourceRecords = parsedData.data || parsedData.institutions || parsedData;

    report.totalSourceRecords = sourceRecords.length;
    if (verbose) console.log(`Step 2: Processing ${report.totalSourceRecords} source institution records...`);

    // 3. Process, normalize, and deduplicate records
    const institutionMap = new Map();

    for (const record of sourceRecords) {
        const rawState = (record.state || '').trim();
        if (rawState && rawState.toLowerCase() !== 'tamil nadu') {
            continue; // Filter to Tamil Nadu only
        }
        report.validTamilNaduRecords++;

        const rawName = cleanInstitutionName(record.institute_name || record.name);
        if (!rawName) continue;

        const officialDistrict = resolveOfficialDistrict(
            record.district,
            record.address,
            rawName
        );

        // Exclude Polytechnic & Diploma institutions
        const upperName = rawName.toUpperCase();
        const upperType = (record.institution_type || '').toUpperCase();
        if (
            upperName.includes('POLYTECHNIC') ||
            upperType.includes('DIPLOMA') ||
            upperType.includes('POLYTECHNIC')
        ) {
            report.dbSkipped++;
            continue;
        }

        if (!officialDistrict) {
            report.unresolvedRecords++;
            report.unresolvedDetails.push({
                name: rawName,
                rawDistrict: record.district,
                address: record.address
            });
            continue;
        }

        // Deduplication key: Name + District + State
        const dedupeKey = `${rawName.toUpperCase()}:::${officialDistrict.toUpperCase()}:::TAMIL NADU`;

        if (institutionMap.has(dedupeKey)) {
            report.duplicatesCollapsed++;
            // Merge program information or other metadata if desirable
            const existing = institutionMap.get(dedupeKey);
            if (!existing.code && record.aicte_id) {
                existing.code = record.aicte_id;
            }
        } else {
            // Check if this record is our host institution (CIT)
            const isCIT = rawName.toUpperCase().includes('COIMBATORE INSTITUTE OF TECHNOLOGY') && officialDistrict === 'Coimbatore';

            institutionMap.set(dedupeKey, {
                name: rawName,
                code: isCIT ? 'TN-CBE-CIT' : (record.aicte_id || record.id || `AICTE-TN-${institutionMap.size + 1}`),
                state: 'Tamil Nadu',
                district: officialDistrict,
                institutionType: record.institution_type || 'Engineering & Technology',
                address: record.address || null,
                university: record.university || null,
                sourceDataset: 'AICTE_TAMIL_NADU_2024',
                sourceRecordId: record.aicte_id || record.other_id || null,
                isActive: true,
                status: 'APPROVED',
                isVerifiedSample: false
            });
        }
    }

    report.uniqueInstitutionsParsed = institutionMap.size;
    if (verbose) {
        console.log(`✓ Unique verified institutions prepared: ${report.uniqueInstitutionsParsed}`);
        console.log(`✓ Multi-course duplicate records consolidated: ${report.duplicatesCollapsed}`);
        console.log(`✓ Unresolved district mapping: ${report.unresolvedRecords}\n`);
        console.log('Step 3: Upserting institution records into MySQL database...');
    }

    // 4. Batch upsert into Database
    let batchCounter = 0;
    for (const inst of institutionMap.values()) {
        try {
            const existingInDb = await prisma.institution.findUnique({
                where: {
                    name_district_state: {
                        name: inst.name,
                        district: inst.district,
                        state: inst.state
                    }
                }
            });

            if (existingInDb) {
                await prisma.institution.update({
                    where: { id: existingInDb.id },
                    data: {
                        // Do not overwrite CIT code if it's already set
                        code: existingInDb.code || inst.code,
                        institutionType: inst.institutionType,
                        address: inst.address,
                        university: inst.university,
                        sourceDataset: inst.sourceDataset,
                        sourceRecordId: inst.sourceRecordId,
                        isActive: true,
                        status: 'APPROVED',
                        isVerifiedSample: false
                    }
                });
                report.dbUpdated++;
            } else {
                await prisma.institution.create({
                    data: inst
                });
                report.dbInserted++;
            }

            batchCounter++;
            if (verbose && batchCounter % 200 === 0) {
                console.log(`  Processed ${batchCounter} / ${report.uniqueInstitutionsParsed} institutions...`);
            }
        } catch (err) {
            report.errors.push(`Error on "${inst.name}" (${inst.district}): ${err.message}`);
        }
    }

    // 5. Ensure host institution (CIT) is verified
    const cit = await prisma.institution.findFirst({
        where: {
            OR: [
                { code: 'TN-CBE-CIT' },
                { name: { contains: 'Coimbatore Institute of Technology' }, district: 'Coimbatore' }
            ]
        }
    });

    if (cit && cit.code !== 'TN-CBE-CIT') {
        await prisma.institution.update({
            where: { id: cit.id },
            data: { code: 'TN-CBE-CIT' }
        });
    }

    if (verbose) {
        console.log('\n===============================================================');
        console.log('✅ Tamil Nadu Institution Directory Import Complete');
        console.log(`- Districts Synced: ${report.districtsImported} / ${TN_OFFICIAL_DISTRICTS_38.length}`);
        console.log(`- Total Records in Dataset: ${report.totalSourceRecords}`);
        console.log(`- Unique Institutions: ${report.uniqueInstitutionsParsed}`);
        console.log(`- Newly Inserted: ${report.dbInserted}`);
        console.log(`- Updated / Refreshed: ${report.dbUpdated}`);
        console.log(`- Errors Encountered: ${report.errors.length}`);
        console.log('===============================================================\n');
    }

    return report;
}

// Allow CLI execution: `node backend/src/scripts/importInstitutions.js`
if (require.main === module) {
    importTamilNaduDirectory()
        .then((report) => {
            console.log('Import finished successfully.');
            process.exit(0);
        })
        .catch((err) => {
            console.error('Fatal import error:', err);
            process.exit(1);
        });
}

module.exports = {
    importTamilNaduDirectory,
    DATASET_METADATA
};
