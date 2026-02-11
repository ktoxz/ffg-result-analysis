const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();
const JWT_SECRET = 'ffg-jwt-secret-key-2024';

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.session.token;

    if (!token) {
        return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token không hợp lệ' });
    }
};

// Register
router.post('/register', (req, res) => {
    try {
        const { username, password, fullName, email } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
        }

        // Check if user exists
        const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Insert user
        const result = db.prepare(`
            INSERT INTO users (username, password, fullName, email) 
            VALUES (?, ?, ?, ?)
        `).run(username, hashedPassword, fullName || '', email || '');

        res.json({
            success: true,
            message: 'Đăng ký thành công!',
            userId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Lỗi đăng ký tài khoản' });
    }
});

// Login
router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
        }

        // Find user
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!user) {
            return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        // Verify password
        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Store token in session
        req.session.token = token;
        req.session.userId = user.id;

        res.json({
            success: true,
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Lỗi đăng nhập' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Đã đăng xuất' });
});

// Get current user
router.get('/me', verifyToken, (req, res) => {
    try {
        const user = db.prepare('SELECT id, username, fullName, email, role, createdAt FROM users WHERE id = ?').get(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Lỗi lấy thông tin người dùng' });
    }
});

// Change password
router.post('/change-password', verifyToken, (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

        if (!bcrypt.compareSync(currentPassword, user.password)) {
            return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        db.prepare('UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
            .run(hashedPassword, req.user.id);

        res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Lỗi đổi mật khẩu' });
    }
});

module.exports = router;
module.exports.verifyToken = verifyToken;
