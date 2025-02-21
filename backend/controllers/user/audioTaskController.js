import { readFileSync } from 'fs';
import path from 'path';




// Fetch batch names
export const getBatchNames = (req, res) => {
    try {
        // Read the file on each request to get the latest data
        const batchData = JSON.parse(readFileSync(path.resolve('batchList.json'), 'utf-8'));
        const batchList = batchData.names.filter(name => name !== 'Arun Thomas BCR64');

        // Set cache control header to disable caching
        res.setHeader('Cache-Control', 'no-store');
        
        // Send the updated batch list
        res.json(batchList);
    } catch (error) {
        console.error('Error fetching names:', error);
        res.status(500).json({ error: 'Failed to fetch names' });
    }
};



// Handle audio task submissions
export const submitAudioTask = (req, res) => {
    try {
        console.log('Received Audio Task:', req.body);
        const { audioTaskDate, taskDescription, notes, submittedNames } = req.body;

        if (!submittedNames || !Array.isArray(submittedNames)) {
            return res.status(400).json({ error: 'Submitted names must be an array' });
        }

        // Read the batch list dynamically for every request
        const batchData = JSON.parse(readFileSync(path.resolve('batchList.json'), 'utf-8'));
        const batchList = batchData.names.filter(name => name !== 'Arun Thomas BCR64');

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
    } catch (error) {
        console.error('Error in submitting audio task:', error);
        res.status(500).json({ error: 'Failed to submit audio task' });
    }
};
