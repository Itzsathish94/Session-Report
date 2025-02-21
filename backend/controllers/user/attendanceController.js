import { unlinkSync } from 'fs';
import csv from 'csvtojson';
import path from 'path';

// Upload attendance CSV and extract names
export const uploadAttendance = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const jsonArray = await csv().fromFile(req.file.path);
        const firstColumnName = Object.keys(jsonArray[0])[0];
        const extractedNames = jsonArray.slice(3).map(row => row[firstColumnName]).filter(name => name);
        unlinkSync(req.file.path);

        res.json({ attendanceInput: extractedNames });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Failed to process file' });
    }
};

// Update attendance
export const updateAttendance = (req, res) => {
    console.log('Received request:', req.body);

    let { names = [], attendedWithOtherBatches = [], attendanceInput = [] } = req.body;
    if (!Array.isArray(names)) names = [];
    if (!Array.isArray(attendedWithOtherBatches)) attendedWithOtherBatches = [];
    if (!Array.isArray(attendanceInput)) attendanceInput = [];

    const normalizeName = (name) => name.split(" (")[0].trim();
    const updatedNamesList = names.filter(name => !attendanceInput.includes(normalizeName(name)));

    const finalAttendees = [
        ...attendedWithOtherBatches.map(n => ({ name: normalizeName(n.name), extra: n.extra })),
        ...attendanceInput.map(name => ({ name: normalizeName(name), extra: '' }))
    ];


    const filterExcludedNames = (name) => !name.toUpperCase().includes('AI NOTETAKER') && !name.toUpperCase().includes('AFZAL') && !name.includes('Full Name');

    const uniqueAttendees = [...new Set(finalAttendees.map(att => att.name))].filter(filterExcludedNames);
    const finalAttendeeNames = uniqueAttendees;
    const absentees = updatedNamesList.filter(name => !finalAttendeeNames.includes(normalizeName(name)) && filterExcludedNames(name));

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
};
