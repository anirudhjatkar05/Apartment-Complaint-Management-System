const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

const app = express();

// MongoDB connection status flag
let mongoConnected = false;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware to check MongoDB connection before database operations
app.use((req, res, next) => {
    // Allow auth routes to work even without MongoDB
    if (req.path.startsWith("/api/auth") || req.path.startsWith("/api/register") || req.path.startsWith("/api/login") || req.path.startsWith("/api/verify")) {
        return next();
    }
    // For other API routes, check MongoDB connection
    if (req.path.startsWith("/api") && !mongoConnected) {
        return res.status(503).json({ 
            success: false, 
            message: "Database connection not ready. Please try again in a moment."
        });
    }
    next();
});

// ✅ Serve Frontend static files (Ensure this folder exists in your root)
app.use(express.static(path.join(__dirname, "Frontend")));

// API Routes
app.use("/api", authRoutes);
app.use("/api/complaints", complaintRoutes);

// ✅ Corrected Catch-all: serve index.html for any unknown route
// This is essential for Single Page Applications (SPAs)
app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
        // Don't serve index.html for API routes
        return next();
    }
    res.sendFile(path.join(__dirname, "Frontend", "index.html"));
});

// Final Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong on the server!" });
});

// Connect to MongoDB then start server
const mongooseOptions = {
    serverSelectionTimeoutMS: 30000,  // Increased to 30 seconds
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,  // Increased to 30 seconds
    maxPoolSize: 10,
    retryWrites: true,
    tls: true
};

const PORT = process.env.PORT || 3000;

// Start server regardless of MongoDB connection
app.listen(PORT, () => {
    console.log(`🚀 Server running → http://localhost:${PORT}`);
});

// Function to connect to MongoDB with retry
const connectMongoDB = () => {
    console.log("🔄 Attempting to connect to MongoDB...");
    mongoose.connect(process.env.MONGO_URI, mongooseOptions)
        .then(() => {
            mongoConnected = true;
            console.log("✅ MongoDB Connected Successfully");
        })
        .catch((err) => {
            console.warn("⚠️  MongoDB connection error:", err.message);
            console.log("🔄 Retrying in 10 seconds...");
            // Retry connection every 10 seconds
            setTimeout(connectMongoDB, 10000);
        });
};

// Start connection attempt
connectMongoDB();