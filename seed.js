const bcrypt = require("bcryptjs");
require("dotenv").config();
const { sequelize, initializeDatabase } = require("./config/database");
const User = require("./models/User");

const seedUsers = async () => {
    try {
        await initializeDatabase();
        await sequelize.authenticate();
        console.log("Connected to MySQL...");
        await sequelize.sync();

        const usersToCreate = [
            {
                name: "System Admin",
                email: "admin@gmail.com",
                password: "adminpassword",
                role: "ADMIN",
                isVerified: true
            },
            {
                name: "John Plumber",
                email: "plumber@gmail.com",
                password: "plumberpassword",
                role: "STAFF",
                isVerified: true,
                department: "Plumbing"
            },
            {
                name: "Bob Plumber",
                email: "plumber2@gmail.com",
                password: "plumber2password",
                role: "STAFF",
                isVerified: true,
                department: "Plumbing"
            },
            {
                name: "Mike Electrician",
                email: "electrician@gmail.com",
                password: "electricianpassword",
                role: "STAFF",
                isVerified: true,
                department: "Electrical"
            },
            {
                name: "Tom Electrician",
                email: "electrician2@gmail.com",
                password: "electrician2password",
                role: "STAFF",
                isVerified: true,
                department: "Electrical"
            },
            {
                name: "Paul Security",
                email: "security@gmail.com",
                password: "securitypassword",
                role: "STAFF",
                isVerified: true,
                department: "Security"
            },
            {
                name: "Sam Security",
                email: "security2@gmail.com",
                password: "security2password",
                role: "STAFF",
                isVerified: true,
                department: "Security"
            }
        ];

        for (let userData of usersToCreate) {
            const existingUser = await User.findOne({ where: { email: userData.email } });

            if (existingUser) {
                console.log(`User ${userData.email} already exists. Updating password and role...`);
                existingUser.password = await bcrypt.hash(userData.password, 10);
                existingUser.role = userData.role;
                existingUser.isVerified = userData.isVerified;
                await existingUser.save();
            } else {
                console.log(`Creating user ${userData.email}...`);
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                await User.create({
                    ...userData,
                    password: hashedPassword
                });
            }
        }

        console.log("Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding data:", err);
        process.exit(1);
    }
};

seedUsers();
