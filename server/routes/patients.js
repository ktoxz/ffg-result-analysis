const express = require('express');
const db = require('../database');
const { verifyToken } = require('./auth');

const router = express.Router();

// Get all patients
router.get('/', verifyToken, (req, res) => {
    try {
        const patients = db.prepare(`
            SELECT p.*, u.fullName as createdByName
            FROM patients p
            LEFT JOIN users u ON p.createdBy = u.id
            ORDER BY p.createdAt DESC
        `).all();

        res.json({ patients });
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({ error: 'Lỗi lấy danh sách bệnh nhân' });
    }
});

// Search patients
router.get('/search', verifyToken, (req, res) => {
    try {
        const { q } = req.query;
        const searchTerm = `%${q}%`;

        const patients = db.prepare(`
            SELECT * FROM patients 
            WHERE fullName LIKE ? OR patientCode LIKE ? OR phone LIKE ?
            ORDER BY fullName ASC
            LIMIT 50
        `).all(searchTerm, searchTerm, searchTerm);

        res.json({ patients });
    } catch (error) {
        console.error('Search patients error:', error);
        res.status(500).json({ error: 'Lỗi tìm kiếm bệnh nhân' });
    }
});

// Get single patient
router.get('/:id', verifyToken, (req, res) => {
    try {
        const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);

        if (!patient) {
            return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });
        }

        // Get patient's test results
        const results = db.prepare(`
            SELECT id, testDate, doctorName, status, createdAt 
            FROM test_results 
            WHERE patientId = ? 
            ORDER BY testDate DESC
        `).all(req.params.id);

        res.json({ patient, results });
    } catch (error) {
        console.error('Get patient error:', error);
        res.status(500).json({ error: 'Lỗi lấy thông tin bệnh nhân' });
    }
});

// Create patient
router.post('/', verifyToken, (req, res) => {
    try {
        const { patientCode, fullName, birthYear, gender, phone, address } = req.body;

        if (!fullName) {
            return res.status(400).json({ error: 'Vui lòng nhập họ tên bệnh nhân' });
        }

        // Generate patient code if not provided
        const code = patientCode || `BN${Date.now().toString().slice(-8)}`;

        const result = db.prepare(`
            INSERT INTO patients (patientCode, fullName, birthYear, gender, phone, address, createdBy)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(code, fullName, birthYear || null, gender || '', phone || '', address || '', req.user.id);

        const newPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid);

        res.json({
            success: true,
            message: 'Thêm bệnh nhân thành công!',
            patient: newPatient
        });
    } catch (error) {
        console.error('Create patient error:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Mã bệnh nhân đã tồn tại' });
        }
        res.status(500).json({ error: 'Lỗi thêm bệnh nhân' });
    }
});

// Update patient
router.put('/:id', verifyToken, (req, res) => {
    try {
        const { fullName, birthYear, gender, phone, address } = req.body;

        db.prepare(`
            UPDATE patients 
            SET fullName = ?, birthYear = ?, gender = ?, phone = ?, address = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(fullName, birthYear || null, gender || '', phone || '', address || '', req.params.id);

        const updatedPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);

        res.json({
            success: true,
            message: 'Cập nhật thành công!',
            patient: updatedPatient
        });
    } catch (error) {
        console.error('Update patient error:', error);
        res.status(500).json({ error: 'Lỗi cập nhật bệnh nhân' });
    }
});

// Delete patient
router.delete('/:id', verifyToken, (req, res) => {
    try {
        // Check if patient has test results
        const hasResults = db.prepare('SELECT COUNT(*) as count FROM test_results WHERE patientId = ?').get(req.params.id);

        if (hasResults.count > 0) {
            return res.status(400).json({
                error: 'Không thể xóa bệnh nhân đã có kết quả xét nghiệm. Vui lòng xóa các kết quả trước.'
            });
        }

        db.prepare('DELETE FROM patients WHERE id = ?').run(req.params.id);

        res.json({ success: true, message: 'Đã xóa bệnh nhân' });
    } catch (error) {
        console.error('Delete patient error:', error);
        res.status(500).json({ error: 'Lỗi xóa bệnh nhân' });
    }
});

module.exports = router;
