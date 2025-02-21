import express from 'express';
import { adminLogin, adminLogout, checkAdminAuth, getBatchNames, addName, updateName, deleteName, toggleCoordinatorName} from '../controllers/admin/adminController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin Login Route
router.post('/login', adminLogin);

// Admin Logout Route
router.post('/logout', requireAdminAuth, adminLogout);

// Check If Admin Is Authenticated
router.get('/check-auth', requireAdminAuth, checkAdminAuth);

// Get all batch names
router.get('/names', requireAdminAuth, getBatchNames);

// Add a new name to the list
router.post('/names', requireAdminAuth, addName);

// Update a name in the list
router.put('/names/:index', requireAdminAuth, updateName);

// Delete a name from the list
router.delete('/names/:index', requireAdminAuth, deleteName);

// Get coordinators file
router.get("/coordinator-list",requireAdminAuth);

// Toggle coordinator name (add/remove)
router.post('/toggle-coordinator', requireAdminAuth, toggleCoordinatorName);

export default router;
