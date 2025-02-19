import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { readFileSync, unlinkSync } from 'fs';
import path from 'path';
import multer from 'multer';
import csv from 'csvtojson';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// File upload setup
const upload = multer({ dest: 'uploads/' });

// Read batch list
const batchData = JSON.parse(readFileSync(path.resolve('batchList.json'), 'utf-8'));
const batchList = batchData.names;

// Endpoint to serve names
app.get('/names', (req, res) => {
    try {
        res.json(batchList);
    } catch (error) {
        console.error('Error fetching names:', error);
        res.status(500).json({ error: 'Failed to fetch names' });
    }
});

// Endpoint to handle audio task submissions
app.post('/audio-task', (req, res) => {
    console.log('Received Audio Task:', req.body);

    const { audioTaskDate, taskDescription, notes, submittedNames } = req.body;

    if (!submittedNames || !Array.isArray(submittedNames)) {
        return res.status(400).json({ error: 'Submitted names must be an array' });
    }

    // Normalize names to match batch list for comparison
    const normalizedSubmitted = submittedNames.map(name => name.trim().toLowerCase());

    // Find submitted and not submitted names
    const submitted = batchList.filter(name => normalizedSubmitted.includes(name.trim().toLowerCase()));
    const notSubmitted = batchList.filter(name => !normalizedSubmitted.includes(name.trim().toLowerCase()));

    console.log({
        audioTaskDate: audioTaskDate || "Not provided",
        taskDescription: taskDescription || "Not provided",
        notes: notes || "Not provided",
        submitted,
        notSubmitted
    });

    res.json({
        message: 'Audio Task Submitted Successfully!',
        submitted,
        notSubmitted
    });
});

// **New Endpoint to Upload CSV and Extract Names for Attendance**
app.post('/upload-attendance', upload.single('attendanceFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Convert CSV to JSON
        const jsonArray = await csv().fromFile(req.file.path);

        // Get the first column name dynamically
        const firstColumnName = Object.keys(jsonArray[0])[0];

        // Extract names (Skipping first 3 rows which are metadata)
        const extractedNames = jsonArray.slice(3).map(row => row[firstColumnName]).filter(name => name);

        // Remove uploaded file after processing
        unlinkSync(req.file.path);

        res.json({ attendanceInput: extractedNames });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Failed to process file' });
    }
});


// Update attendance
app.post('/update-attendance', (req, res) => {
    console.log('Received request:', req.body);

    let { names = [], attendedWithOtherBatches = [], attendanceInput = [] } = req.body;

    if (!Array.isArray(names)) names = [];
    if (!Array.isArray(attendedWithOtherBatches)) attendedWithOtherBatches = [];
    if (!Array.isArray(attendanceInput)) attendanceInput = [];

    // Normalize name function to handle extra text
    const normalizeName = (name) => name.split(" (")[0].trim();

    // Remove selected names from names list and add them to attendance list
    const updatedNamesList = names.filter(name => !attendanceInput.includes(normalizeName(name)));

    // Merge attended with extra text into the final attendance list
    const finalAttendees = [
        ...attendedWithOtherBatches.map(n => ({ name: normalizeName(n.name), extra: n.extra })),
        ...attendanceInput.map(name => ({ name: normalizeName(name), extra: '' }))
    ];

    // Remove any attendees or absentees with "AI NOTETAKER" or "Afzal" in their name
    const filterExcludedNames = (name) => !name.toUpperCase().includes('AI NOTETAKER') && !name.toUpperCase().includes('AFZAL');

    // Ensure uniqueness by using a Set to remove duplicates and filter out names with "AI NOTETAKER" or "Afzal"
    const uniqueAttendees = [
        ...new Set(finalAttendees.map(att => att.name))
    ].filter(filterExcludedNames);

    // Identify absentees (from the remaining names list that are not in finalAttendees)
    const finalAttendeeNames = uniqueAttendees;
    const absentees = updatedNamesList.filter(name => !finalAttendeeNames.includes(normalizeName(name)) && filterExcludedNames(name));

    // Send back the final list of attendees with extra text, and absentees
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
