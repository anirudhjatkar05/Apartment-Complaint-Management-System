// ── App Logic & Backend API ───────────────────────────────
const API_BASE = '/api';   // same-origin: served by Express

// ── Auth Helpers ──────────────────────────────────────────
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('currentUser')); }
    catch(e) { return null; }
}

function requireAuth(role = null) {
    const user = getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return null; }
    if (role && user.role !== role) {
        if      (user.role === 'ADMIN') window.location.href = 'admin_dashboard.html';
        else if (user.role === 'STAFF') window.location.href = 'staff_dashboard.html';
        else                            window.location.href = 'user_dashboard.html';
        return null;
    }
    return user;
}

async function forgotPassword(email) {
    try {
        const res = await fetch(`${API_BASE}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        return data;
    } catch (err) { console.error(err); return { success: false, message: 'Network error' }; }
}

async function resetPassword(email, otp, newPassword) {
    try {
        const res = await fetch(`${API_BASE}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, newPassword })
        });
        const data = await res.json();
        return data;
    } catch (err) { console.error(err); return { success: false, message: 'Network error' }; }
}

// ── Complaint Actions ─────────────────────────────────────

async function fileComplaint(userId, title, description, imageBase64) {
    try {
        const res = await fetch(`${API_BASE}/complaints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, title, description, category: title, imageBase64 })
        });
        const data = await res.json();
        if (!data.success) { alert('Failed: ' + (data.message || 'Unknown error')); return null; }
        return data.complaint;
    } catch (err) {
        alert('Could not reach the server. Make sure you opened http://localhost:3000');
        console.error(err); return null;
    }
}

async function getUserComplaints(userId) {
    try {
        const res = await fetch(`${API_BASE}/complaints/user/${userId}`);
        const data = await res.json();
        return data.complaints || [];
    } catch (err) { console.error(err); return []; }
}

async function getAllComplaints() {
    try {
        const res = await fetch(`${API_BASE}/complaints`);
        const data = await res.json();
        return data.complaints || [];
    } catch (err) { console.error(err); return []; }
}

async function getStaffComplaints(staffId) {
    try {
        const res = await fetch(`${API_BASE}/complaints/assigned/${staffId}`);
        const data = await res.json();
        return data.complaints || [];
    } catch (err) { console.error(err); return []; }
}

async function updateComplaintStatus(complaintId, status, adminComment, assignedStaffId, staffProgressNote) {
    try {
        const body = {};
        if (status            !== undefined) body.status           = status;
        if (adminComment      !== undefined) body.adminComment     = adminComment;
        if (assignedStaffId   !== undefined) body.assignedStaffId  = assignedStaffId;
        if (staffProgressNote !== undefined) body.staffProgressNote = staffProgressNote;

        const res = await fetch(`${API_BASE}/complaints/${complaintId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        return data.success;
    } catch (err) { console.error(err); return false; }
}

async function assignStaffToComplaint(complaintId, staffId) {
    return updateComplaintStatus(complaintId, undefined, undefined, staffId, undefined);
}

async function staffUpdateComplaint(complaintId, status, progressNote) {
    return updateComplaintStatus(complaintId, status, undefined, undefined, progressNote);
}

async function getAllStaffMembers() {
    try {
        const res = await fetch(`${API_BASE}/complaints/staff-list`);
        const data = await res.json();
        return data.staff || [];
    } catch (err) { console.error(err); return []; }
}

async function addStaffMember(name, email, password, department) {
    try {
        const res = await fetch(`${API_BASE}/complaints/staff`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, department })
        });
        const data = await res.json();
        return data;
    } catch (err) { console.error(err); return { success: false, message: 'Network error' }; }
}

async function deleteStaffMember(staffId) {
    try {
        const res = await fetch(`${API_BASE}/complaints/staff/${staffId}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        return data;
    } catch (err) { console.error(err); return { success: false, message: 'Network error' }; }
}

async function getSystemStats() {
    try {
        const res = await fetch(`${API_BASE}/complaints/stats`);
        const data = await res.json();
        return data.stats || null;
    } catch (err) { console.error(err); return null; }
}

// ── UI Helpers ────────────────────────────────────────────
function formatDate(isoString) {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function getStatusBadgeClass(status) {
    if (!status) return '';
    switch (status.toLowerCase().replace(' ', '_')) {
        case 'pending':     return 'badge-pending';
        case 'in_progress': return 'badge-in_progress';
        case 'resolved':    return 'badge-resolved';
        default:            return '';
    }
}
