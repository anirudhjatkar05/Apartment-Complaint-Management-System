const Complaint = require("../models/Complaint");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

function mapStatus(status) {
    const map = {
        "PENDING": "Pending",
        "IN_PROGRESS": "In Progress",
        "RESOLVED": "Resolved",
        "Pending": "Pending",
        "In Progress": "In Progress",
        "Resolved": "Resolved"
    };
    return map[status] || "Pending";
}

const createComplaint = async (req, res) => {
    try {
        const { title, description, category, priority, apartmentNumber, userId, imageBase64 } = req.body;

        if (!title || !description) {
            return res.status(400).json({ success: false, message: "Title and description are required." });
        }

        const complaint = await Complaint.create({
            title,
            description,
            category: category || title,
            priority: priority || "Medium",
            apartmentNumber: apartmentNumber || "N/A",
            userId: userId || null,
            imageBase64: imageBase64 || null
        });

        res.status(201).json({ success: true, complaint });
    } catch (error) {
        console.error("Create complaint error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.findAll({
            include: [
                { model: User, as: 'user', attributes: ['name', 'email', 'role'] },
                { model: User, as: 'assignedStaff', attributes: ['name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ success: true, complaints });
    } catch (error) {
        console.error("Get all complaints error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUserComplaints = async (req, res) => {
    try {
        const { userId } = req.params;
        const complaints = await Complaint.findAll({
            where: { userId },
            include: [
                { model: User, as: 'assignedStaff', attributes: ['name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ success: true, complaints });
    } catch (error) {
        console.error("Get user complaints error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getStaffComplaints = async (req, res) => {
    try {
        const { staffId } = req.params;
        const complaints = await Complaint.findAll({
            where: { assignedStaffId: staffId },
            include: [
                { model: User, as: 'user', attributes: ['name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ success: true, complaints });
    } catch (error) {
        console.error("Get staff complaints error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminComment, assignedStaffId, staffProgressNote } = req.body;

        const complaint = await Complaint.findByPk(id);
        if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

        if (status) complaint.status = mapStatus(status);
        if (adminComment !== undefined) complaint.adminComment = adminComment;
        if (assignedStaffId !== undefined) complaint.assignedStaffId = assignedStaffId || null;
        if (staffProgressNote !== undefined) complaint.staffProgressNote = staffProgressNote;

        await complaint.save();

        res.status(200).json({ success: true, complaint });
    } catch (error) {
        console.error("Update complaint error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllStaff = async (req, res) => {
    try {
        const staff = await User.findAll({
            where: { role: "STAFF" },
            attributes: ['id', 'name', 'email', 'role']
        });
        res.status(200).json({ success: true, staff });
    } catch (error) {
        console.error("Get staff error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const addStaff = async (req, res) => {
    try {
        const { name, email, password, department } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email, and password are required." });
        }
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({ success: false, message: "A user with this email already exists." });
        }
        const hashed = await bcrypt.hash(password, 10);
        const staff = await User.create({
            name,
            email,
            password: hashed,
            role: "STAFF",
            isVerified: true,
            department: department || "General"
        });
        res.status(201).json({ success: true, staff: { id: staff.id, name: staff.name, email: staff.email, role: staff.role } });
    } catch (error) {
        console.error("Add staff error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await User.findOne({ where: { id, role: "STAFF" } });
        if (!staff) return res.status(404).json({ success: false, message: "Staff member not found." });
        // Unassign any complaints assigned to this staff
        await Complaint.update({ assignedStaffId: null }, { where: { assignedStaffId: id } });
        await staff.destroy();
        res.status(200).json({ success: true, message: "Staff member removed successfully." });
    } catch (error) {
        console.error("Delete staff error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSystemStats = async (req, res) => {
    try {
        const totalComplaints = await Complaint.count();
        const pendingComplaints = await Complaint.count({ where: { status: 'Pending' } });
        const resolvedComplaints = await Complaint.count({ where: { status: 'Resolved' } });
        const totalResidents = await User.count({ where: { role: 'USER' } });
        const totalStaff = await User.count({ where: { role: 'STAFF' } });
        res.status(200).json({ success: true, stats: { totalComplaints, pendingComplaints, resolvedComplaints, totalResidents, totalStaff } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createComplaint,
    getAllComplaints,
    getUserComplaints,
    getStaffComplaints,
    updateComplaintStatus,
    getAllStaff,
    addStaff,
    deleteStaff,
    getSystemStats
};