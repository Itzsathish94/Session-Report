import express from 'express';
import cors from 'cors';
// import bodyParser from 'body-parser';
import session from 'express-session';
import 'dotenv/config'; // ✅ Correct import for ES modules

import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: "https://boomerv1.netlify.app", // ✅ Replace with your frontend URL,'http://localhost:5173'
    credentials: true // ✅ Allows cookies to be sent
}));

// Middleware
app.use(express.json());

// Session Middleware (supports login persistence)
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecret', // Load from .env for security
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// User Routes
app.use('/api/user', userRoutes);

// 🔒 Protect all admin routes
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
