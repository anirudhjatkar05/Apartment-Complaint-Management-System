const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Complaint = sequelize.define('Complaint', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    priority: {
        type: DataTypes.ENUM("Low", "Medium", "High"),
        defaultValue: "Medium"
    },
    apartmentNumber: {
        type: DataTypes.STRING,
        defaultValue: "N/A"
    },
    status: {
        type: DataTypes.ENUM("Pending", "In Progress", "Resolved"),
        defaultValue: "Pending"
    },
    adminComment: {
        type: DataTypes.TEXT,
        defaultValue: ""
    },
    staffProgressNote: {
        type: DataTypes.TEXT,
        defaultValue: ""
    },
    imageBase64: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    }
}, {
    timestamps: true
});

// Define Relationships
User.hasMany(Complaint, { foreignKey: 'userId', as: 'complaints' });
Complaint.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Complaint, { foreignKey: 'assignedStaffId', as: 'assignedTasks' });
Complaint.belongsTo(User, { foreignKey: 'assignedStaffId', as: 'assignedStaff' });

module.exports = Complaint;