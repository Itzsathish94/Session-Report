import express from 'express';
import cors from 'cors';
import session from 'express-session';
import 'dotenv/config'; 

import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;


const allowedOrigins = [
  "http://localhost:5173",  
  "https://boomerv1.netlify.app"  
];


app.use(
  cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); 
        if (allowedOrigins.includes(origin)) {
          callback(null, origin); 
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// Middleware
app.use(express.json());

app.set("trust proxy", 1); // For cookies to work behind a proxy

app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
    }
}));


// User Routes
app.use('/api/user', userRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
