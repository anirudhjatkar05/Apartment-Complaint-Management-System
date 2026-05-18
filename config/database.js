const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'complaint_db';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || 3306;

// Function to create the database if it doesn't exist
const initializeDatabase = async () => {
    try {
        const connection = await mysql.createConnection({
            host: dbHost,
            port: dbPort,
            user: dbUser,
            password: dbPassword
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        console.log(`Database '${dbName}' checked/created successfully.`);
        await connection.end();
    } catch (error) {
        console.error('Error creating database:', error.message);
        throw error;
    }
};

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false
});

module.exports = { sequelize, initializeDatabase };
