const express = require("express");
const router = express.Router();

const {
    createComplaint,
    getAllComplaints,
    getUserComplaints,
    getStaffComplaints,
    updateComplaintStatus,
    getAllStaff,
    addStaff,
    deleteStaff,
    getSystemStats
} = require("../controllers/complaintcontroller");

router.post("/", createComplaint);                            // POST   /api/complaints
router.get("/", getAllComplaints);                            // GET    /api/complaints
router.get("/stats", getSystemStats);                        // GET    /api/complaints/stats        ← BEFORE /:id routes
router.get("/staff-list", getAllStaff);                      // GET    /api/complaints/staff-list   ← BEFORE /:id routes
router.post("/staff", addStaff);                             // POST   /api/complaints/staff
router.delete("/staff/:id", deleteStaff);                   // DELETE /api/complaints/staff/:id
router.get("/user/:userId", getUserComplaints);              // GET    /api/complaints/user/:userId
router.get("/assigned/:staffId", getStaffComplaints);        // GET    /api/complaints/assigned/:staffId
router.put("/:id/status", updateComplaintStatus);            // PUT    /api/complaints/:id/status

module.exports = router;