const express = require('express');
const db = require('../database');
const { verifyToken } = require('./auth');

const router = express.Router();

// Get all results with pagination
router.get('/', verifyToken, (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const results = db.prepare(`
            SELECT r.*, p.fullName as patientName, p.patientCode, p.birthYear, p.gender,
                   u.fullName as createdByName
            FROM test_results r
            JOIN patients p ON r.patientId = p.id
            LEFT JOIN users u ON r.createdBy = u.id
            ORDER BY r.createdAt DESC
            LIMIT ? OFFSET ?
        `).all(limit, offset);

        const total = db.prepare('SELECT COUNT(*) as count FROM test_results').get();

        res.json({
            results,
            pagination: {
                page,
                limit,
                total: total.count,
                totalPages: Math.ceil(total.count / limit)
            }
        });
    } catch (error) {
        console.error('Get results error:', error);
        res.status(500).json({ error: 'Lỗi lấy danh sách kết quả' });
    }
});

// Search results
router.get('/search', verifyToken, (req, res) => {
    try {
        const { q, startDate, endDate } = req.query;
        let query = `
            SELECT r.*, p.fullName as patientName, p.patientCode, p.birthYear, p.gender
            FROM test_results r
            JOIN patients p ON r.patientId = p.id
            WHERE 1=1
        `;
        const params = [];

        if (q) {
            query += ` AND (p.fullName LIKE ? OR p.patientCode LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`);
        }

        if (startDate) {
            query += ` AND r.testDate >= ?`;
            params.push(startDate);
        }

        if (endDate) {
            query += ` AND r.testDate <= ?`;
            params.push(endDate);
        }

        query += ` ORDER BY r.testDate DESC LIMIT 100`;

        const results = db.prepare(query).all(...params);

        res.json({ results });
    } catch (error) {
        console.error('Search results error:', error);
        res.status(500).json({ error: 'Lỗi tìm kiếm kết quả' });
    }
});

// Get single result
router.get('/:id', verifyToken, (req, res) => {
    try {
        const result = db.prepare(`
            SELECT r.*, p.fullName as patientName, p.patientCode, p.birthYear, p.gender, p.phone, p.address
            FROM test_results r
            JOIN patients p ON r.patientId = p.id
            WHERE r.id = ?
        `).get(req.params.id);

        if (!result) {
            return res.status(404).json({ error: 'Không tìm thấy kết quả' });
        }

        // Parse JSON fields
        if (result.gaugeData) result.gaugeData = JSON.parse(result.gaugeData);
        if (result.labResults) result.labResults = JSON.parse(result.labResults);
        if (result.analysisData) result.analysisData = JSON.parse(result.analysisData);
        if (result.customFields) result.customFields = JSON.parse(result.customFields);

        res.json({ result });
    } catch (error) {
        console.error('Get result error:', error);
        res.status(500).json({ error: 'Lỗi lấy kết quả' });
    }
});

// Create result
router.post('/', verifyToken, (req, res) => {
    try {
        const {
            patientId,
            testDate,
            doctorName,
            gaugeData,
            labResults,
            analysisData,
            customFields,
            status
        } = req.body;

        if (!patientId || !testDate) {
            return res.status(400).json({ error: 'Vui lòng chọn bệnh nhân và ngày xét nghiệm' });
        }

        // Check if patient exists
        const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(patientId);
        if (!patient) {
            return res.status(400).json({ error: 'Bệnh nhân không tồn tại' });
        }

        const result = db.prepare(`
            INSERT INTO test_results (patientId, testDate, doctorName, gaugeData, labResults, analysisData, customFields, status, createdBy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            patientId,
            testDate,
            doctorName || '',
            JSON.stringify(gaugeData || {}),
            JSON.stringify(labResults || {}),
            JSON.stringify(analysisData || {}),
            JSON.stringify(customFields || {}),
            status || 'draft',
            req.user.id
        );

        res.json({
            success: true,
            message: 'Lưu kết quả thành công!',
            resultId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Create result error:', error);
        res.status(500).json({ error: 'Lỗi lưu kết quả' });
    }
});

// Update result
router.put('/:id', verifyToken, (req, res) => {
    try {
        const {
            testDate,
            doctorName,
            gaugeData,
            labResults,
            analysisData,
            customFields,
            status
        } = req.body;

        db.prepare(`
            UPDATE test_results 
            SET testDate = ?, doctorName = ?, gaugeData = ?, labResults = ?, 
                analysisData = ?, customFields = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            testDate,
            doctorName || '',
            JSON.stringify(gaugeData || {}),
            JSON.stringify(labResults || {}),
            JSON.stringify(analysisData || {}),
            JSON.stringify(customFields || {}),
            status || 'draft',
            req.params.id
        );

        res.json({
            success: true,
            message: 'Cập nhật kết quả thành công!'
        });
    } catch (error) {
        console.error('Update result error:', error);
        res.status(500).json({ error: 'Lỗi cập nhật kết quả' });
    }
});

// Delete result
router.delete('/:id', verifyToken, (req, res) => {
    try {
        db.prepare('DELETE FROM test_results WHERE id = ?').run(req.params.id);
        res.json({ success: true, message: 'Đã xóa kết quả' });
    } catch (error) {
        console.error('Delete result error:', error);
        res.status(500).json({ error: 'Lỗi xóa kết quả' });
    }
});

// Duplicate result
router.post('/:id/duplicate', verifyToken, (req, res) => {
    try {
        const original = db.prepare('SELECT * FROM test_results WHERE id = ?').get(req.params.id);

        if (!original) {
            return res.status(404).json({ error: 'Không tìm thấy kết quả gốc' });
        }

        const result = db.prepare(`
            INSERT INTO test_results (patientId, testDate, doctorName, gaugeData, labResults, analysisData, customFields, status, createdBy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            original.patientId,
            new Date().toISOString().split('T')[0],
            original.doctorName,
            original.gaugeData,
            original.labResults,
            original.analysisData,
            original.customFields,
            'draft',
            req.user.id
        );

        res.json({
            success: true,
            message: 'Nhân bản kết quả thành công!',
            resultId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Duplicate result error:', error);
        res.status(500).json({ error: 'Lỗi nhân bản kết quả' });
    }
});

module.exports = router;
