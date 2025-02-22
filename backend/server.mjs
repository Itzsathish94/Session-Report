import express from 'express';
import cors from 'cors';
// import bodyParser from 'body-parser';
import session from 'express-session';
import 'dotenv/config'; // ✅ Correct import for ES modules

import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
    console.log("Incoming request from origin:", req.headers.origin);
    next();
});

const allowedOrigins = [
  "http://localhost:5173",  // ✅ Local development
  "https://boomerv1.netlify.app"  // ✅ Deployed frontend
];


app.use(
  cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // Allow non-browser requests like Postman
        if (allowedOrigins.includes(origin)) {
          callback(null, origin); // Set origin dynamically
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
    res.send("CORS is working!");
  });

// Middleware
app.use(express.json());

app.set("trust proxy", 1); // ✅ Required for cookies to work behind a proxy

app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // ✅ `true` only in production
        sameSite: "None",
    }
}));


// User Routes
app.use('/api/user', userRoutes);

// 🔒 Protect all admin routes
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
