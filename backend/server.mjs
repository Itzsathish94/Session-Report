import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';
import path from 'path';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Read batch list
const batchData = JSON.parse(readFileSync(path.resolve('batchList.json'), 'utf-8'));
const batchList = batchData.names; // Preserve original casing

// Helper function to clean names (remove attended batch details)
const normalizeName = (name) => {
    return name.replace(/\(Attended with BCR \d+\)/i, '').trim();
};

// NEW: Endpoint to serve names
app.get('/names', (req, res) => {
    try {
        res.json(batchList);
    } catch (error) {
        console.error('Error fetching names:', error);
        res.status(500).json({ error: 'Failed to fetch names' });
    }
});

app.post('/update-attendance', (req, res) => {
    console.log('Received request:', req.body);

    let { names = [], attendedWithOtherBatches = [], attendanceInput = [] } = req.body;

    if (!Array.isArray(names)) names = [];
    if (!Array.isArray(attendedWithOtherBatches)) attendedWithOtherBatches = [];
    if (!Array.isArray(attendanceInput)) attendanceInput = [];

    // Normalize name function to handle extra text
    const normalizeName = (name) => name.split(" (")[0].trim();

    // 1. Remove selected names from names list and add them to attendance list
    const updatedNamesList = names.filter(name => !attendanceInput.includes(normalizeName(name)));

    // 2. Merge attended with extra text into the final attendance list
    const finalAttendees = [
        ...attendedWithOtherBatches.map(n => ({ name: normalizeName(n.name), extra: n.extra })),
        ...attendanceInput.map(name => ({ name: normalizeName(name), extra: '' }))
    ];

    // 3. Remove any attendees or absentees with "AI NOTETAKER" or "Afzal" in their name
    const filterExcludedNames = (name) => !name.toUpperCase().includes('AI NOTETAKER') && !name.toUpperCase().includes('AFZAL');

    // 4. Ensure uniqueness by using a Set to remove duplicates and filter out names with "AI NOTETAKER" or "Afzal"
    const uniqueAttendees = [
        ...new Set(finalAttendees.map(att => att.name))
    ].filter(filterExcludedNames);

    // 5. Identify absentees (from the remaining names list that are not in finalAttendees)
    const finalAttendeeNames = uniqueAttendees;
    const absentees = updatedNamesList.filter(name => !finalAttendeeNames.includes(normalizeName(name)) && filterExcludedNames(name));

    // 6. Send back the final list of attendees with extra text, and absentees
    const updatedAttendees = uniqueAttendees.map(name => {
        const extraText = attendedWithOtherBatches.find(
            batch => normalizeName(batch.name) === normalizeName(name)
        )?.extra || '';
        return extraText ? `${name} (${extraText})` : name;
    });

    res.json({
        attendees: updatedAttendees,
        absentees
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
