import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const coordinatorListPath = path.join(__dirname, '../../coordinatorList.json');

export const getBatchNames = async (req, res) => {
    try {
        const batchListPath = path.join(__dirname, '../../batchList.json');
        const data = await fs.promises.readFile(batchListPath, 'utf-8');
        const batchList = JSON.parse(data);
        res.status(200).json(batchList.names);
    } catch (err) {
        console.error('Error fetching batch names:', err);
        res.status(500).json({ message: 'Failed to fetch batch names' });
    }
};

export const adminLogin = (req, res) => {
    const { username, password } = req.body;

    const ADMIN_CREDENTIALS = {
        username: 'admin',
        password: 'admin123'
    };

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        req.session.admin = { username }; 

        req.session.save(err => {  
            if (err) {
                console.error("Session save error:", err);
                return res.status(500).json({ message: 'Session save error' });
            }

            console.log('✅ Session Stored:', req.session);
            res.status(200).json({ message: 'Login successful', admin: req.session.admin });
        });

    } else {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
};


export const adminLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout failed:', err);
            return res.status(500).json({ message: 'Logout failed' });
        }
        console.log('Session destroyed');
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Logged out successfully' });
    });
};

export const checkAdminAuth = (req, res) => {
    if (req.session.admin) {
        return res.status(200).json({ authenticated: true, admin: req.session.admin });
    } else {
        return res.status(401).json({ authenticated: false });
    }
};

export const addName = async (req, res) => {
    const { name } = req.body;

    const batchListPath = path.join(__dirname, '../../batchList.json');
    
    // Input validation
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: 'Name is required and should be a string' });
    }

    try {
        const data = await fs.promises.readFile(batchListPath, 'utf-8');
        let batchList = JSON.parse(data);

        // Add the new name to the batch list
        batchList.names.unshift(name);

        // Write the updated data back to the file
        await fs.promises.writeFile(batchListPath, JSON.stringify(batchList, null, 2));

        console.log('Name added successfully');
        return res.status(200).json({ message: 'Name added successfully', name });
    } catch (err) {
        console.error('Error processing batchList.json:', err);
        return res.status(500).json({ message: 'Error processing batchList.json' });
    }
};


// Update a name in the list
export const updateName = (req, res) => {
    const { index } = req.params;
    const { name, bwStatus } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    const batchListPath = path.join(__dirname, '../../batchList.json');

    // Read the batch list from the file
    fs.readFile(batchListPath, 'utf-8', (err, data) => {
        if (err) return res.status(500).json({ message: 'Error reading batchList.json' });

        let batchList = JSON.parse(data);
        const nameIndex = parseInt(index);

        if (isNaN(nameIndex)) {
            return res.status(400).json({ message: 'Invalid index' });
        }

        if (nameIndex < 0 || nameIndex >= batchList.names.length) {
            return res.status(400).json({ message: 'Invalid index' });
        }

        // Update the name at the specified index
        let updatedName = name;

        // If bwStatus is provided, modify the name 
        if (bwStatus !== undefined) {
            if (bwStatus) {
                updatedName = `${updatedName} (BW)`; // Append (BW) if checked
            } else {
                updatedName = updatedName.replace(' (BW)', ''); // Remove (BW) if unchecked
            }
        }

        // Update the name in the batch list
        batchList.names[nameIndex] = updatedName;

        // Save the updated batch list to the file
        fs.writeFile(batchListPath, JSON.stringify(batchList, null, 2), (err) => {
            if (err) return res.status(500).json({ message: 'Error saving batchList.json' });

            // Returning the updated name list or the updated name
            res.status(200).json({ message: 'Name updated successfully', updatedName, updatedNames: batchList.names });
        });
    });
};

// Delete a name from the list
export const deleteName = (req, res) => {
    const { index } = req.params;

    const batchListPath = path.join(__dirname, '../../batchList.json');

    fs.readFile(batchListPath, 'utf-8', (err, data) => {
        if (err) return res.status(500).json({ message: 'Error reading batchList.json' });

        let batchList = JSON.parse(data);
        const nameIndex = parseInt(index);

        if (nameIndex < 0 || nameIndex >= batchList.names.length) {
            return res.status(400).json({ message: 'Invalid index' });
        }

        const deletedName = batchList.names.splice(nameIndex, 1);

        fs.writeFile(batchListPath, JSON.stringify(batchList, null, 2), (err) => {
            if (err) return res.status(500).json({ message: 'Error saving batchList.json' });
            res.status(200).json({ message: 'Name deleted successfully', deletedName });
        });
    });
};


// Toggle coordinator's name in the list
export const toggleCoordinatorName = (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    try {
        fs.readFile(coordinatorListPath, 'utf-8', (err, data) => {
            if (err) return res.status(500).json({ message: 'Error reading coordinators.json' });

            let coordinatorList = JSON.parse(data);
            
            console.log("Current coordinator list:", coordinatorList); // Log the coordinator list to check the data

            // Ensure coordinatorList is an array
            if (!Array.isArray(coordinatorList.coordinators)) {
                return res.status(500).json({ message: 'coordinators field is not an array' });
            }

            // Check if the name is already in the coordinator list
            if (coordinatorList.coordinators.includes(name)) {
                // Remove the name from the list
                coordinatorList.coordinators = coordinatorList.coordinators.filter(c => c !== name);
            } else if (coordinatorList.coordinators.length < 2) {
                // Add the name to the list if there are fewer than 2 coordinators
                coordinatorList.coordinators.push(name);
            } else {
                // If there are already 2 coordinators, do not add any more
                return res.status(400).json({ message: 'Only two coordinators are allowed' });
            }

            // Save the updated coordinator list to the file
            fs.writeFile(coordinatorListPath, JSON.stringify(coordinatorList, null, 2), (err) => {
                if (err) return res.status(500).json({ message: 'Error saving coordinators.json' });

                // Return the updated coordinator list
                res.status(200).json({ message: 'Coordinator list updated successfully', coordinatorList });
            });
        });
    } catch (err) {
        console.error('Error processing coordinator list:', err);
        res.status(500).json({ message: 'Error processing coordinator list' });
    }
};
