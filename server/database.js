const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'data', 'ffg_results.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
function initDatabase() {
    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            fullName TEXT,
            email TEXT,
            role TEXT DEFAULT 'user',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Patients table
    db.exec(`
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patientCode TEXT UNIQUE,
            fullName TEXT NOT NULL,
            birthYear INTEGER,
            gender TEXT,
            phone TEXT,
            address TEXT,
            createdBy INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (createdBy) REFERENCES users(id)
        )
    `);

    // Test Results table
    db.exec(`
        CREATE TABLE IF NOT EXISTS test_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patientId INTEGER NOT NULL,
            testDate DATE NOT NULL,
            doctorName TEXT,
            status TEXT DEFAULT 'draft',
            gaugeData TEXT,
            labResults TEXT,
            analysisData TEXT,
            customFields TEXT,
            createdBy INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patientId) REFERENCES patients(id),
            FOREIGN KEY (createdBy) REFERENCES users(id)
        )
    `);

    // Create default admin user if not exists
    const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
    if (!adminExists) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.prepare(`
            INSERT INTO users (username, password, fullName, role) 
            VALUES (?, ?, ?, ?)
        `).run('admin', hashedPassword, 'Administrator', 'admin');
        console.log('✅ Đã tạo tài khoản admin mặc định (admin/admin123)');
    }

    console.log('✅ Database đã được khởi tạo thành công!');
}

// Initialize on module load
try {
    const fs = require('fs');
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    initDatabase();
} catch (error) {
    console.error('❌ Lỗi khởi tạo database:', error);
}

module.exports = db;
