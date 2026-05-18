const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { sequelize, initializeDatabase } = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

const app = express();

let dbConnected = false;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware to check Database connection before database operations
app.use((req, res, next) => {
    // Allow auth routes to work even without Database
    if (req.path.startsWith("/api/auth") || req.path.startsWith("/api/register") || req.path.startsWith("/api/login") || req.path.startsWith("/api/verify")) {
        return next();
    }
    // For other API routes, check Database connection
    if (req.path.startsWith("/api") && !dbConnected) {
        return res.status(503).json({ 
            success: false, 
            message: "Database connection not ready. Please try again in a moment."
        });
    }
    next();
});

// Serve Frontend static files
app.use(express.static(path.join(__dirname, "Frontend")));

// API Routes
app.use("/api", authRoutes);
app.use("/api/complaints", complaintRoutes);

// Catch-all: serve index.html for any unknown route
app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
        return next();
    }
    res.sendFile(path.join(__dirname, "Frontend", "index.html"));
});

// Final Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong on the server!" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`🚀 Server running → http://localhost:${PORT}`);
    await connectMySQL();
});

// Function to connect to MySQL
const connectMySQL = async () => {
    try {
        console.log("🔄 Attempting to initialize and connect to MySQL...");
        await initializeDatabase();
        await sequelize.authenticate();
        console.log("✅ MySQL Connected Successfully");
        
        // Sync models
        await sequelize.sync();
        console.log("✅ Models synchronized.");
        dbConnected = true;
    } catch (err) {
        console.warn("⚠️  MySQL connection error:", err.message);
        console.log("🔄 Retrying in 10 seconds...");
        setTimeout(connectMySQL, 10000);
    }
};