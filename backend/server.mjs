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
    origin: "https://boomerv1.netlify.app", // ✅ Your frontend URL
    credentials: true, // ✅ Allows cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE"], // ✅ Ensure all necessary methods are allowed
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Allow required headers
}));

// Middleware
app.use(express.json());

// Session Middleware (supports login persistence)
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, // Prevent client-side access
        secure: true, // ✅ Must be `true` in production since Netlify & Render use HTTPS
        sameSite: "None", // ✅ Required for cross-origin cookies
    }
}));

// User Routes
app.use('/api/user', userRoutes);

// 🔒 Protect all admin routes
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
