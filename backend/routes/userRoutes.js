import express from 'express';
import multer from 'multer';
import { getBatchNames, submitAudioTask } from '../controllers/user/audioTaskController.js';
import { uploadAttendance, updateAttendance } from '../controllers/user/attendanceController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/names', getBatchNames);
router.post('/audio-task', submitAudioTask);
router.post('/upload-attendance', upload.single('attendanceFile'), uploadAttendance);
router.post('/update-attendance', updateAttendance);

export default router;
