/**
 * Script khởi tạo database và dữ liệu mẫu
 */

const db = require('./database');
const bcrypt = require('bcryptjs');

console.log('🔧 Khởi tạo database...');

// Tạo thêm user mẫu
const users = [
    { username: 'doctor1', password: 'doctor123', fullName: 'BS. Nguyễn Văn A', role: 'doctor' },
    { username: 'nurse1', password: 'nurse123', fullName: 'ĐD. Trần Thị B', role: 'nurse' }
];

users.forEach(user => {
    const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(user.username);
    if (!exists) {
        const hashedPassword = bcrypt.hashSync(user.password, 10);
        db.prepare(`
            INSERT INTO users (username, password, fullName, role) 
            VALUES (?, ?, ?, ?)
        `).run(user.username, hashedPassword, user.fullName, user.role);
        console.log(`✅ Đã tạo user: ${user.username}`);
    }
});

// Tạo bệnh nhân mẫu
const patients = [
    { patientCode: 'BN001', fullName: 'HUỲNH NGỌC MỸ EM', birthYear: 1988, gender: 'Nữ', phone: '0901234567' },
    { patientCode: 'BN002', fullName: 'NGUYỄN VĂN NAM', birthYear: 1975, gender: 'Nam', phone: '0912345678' },
    { patientCode: 'BN003', fullName: 'TRẦN THỊ HƯƠNG', birthYear: 1990, gender: 'Nữ', phone: '0923456789' }
];

patients.forEach(patient => {
    const exists = db.prepare('SELECT id FROM patients WHERE patientCode = ?').get(patient.patientCode);
    if (!exists) {
        db.prepare(`
            INSERT INTO patients (patientCode, fullName, birthYear, gender, phone, createdBy) 
            VALUES (?, ?, ?, ?, ?, 1)
        `).run(patient.patientCode, patient.fullName, patient.birthYear, patient.gender, patient.phone);
        console.log(`✅ Đã tạo bệnh nhân: ${patient.fullName}`);
    }
});

console.log('');
console.log('🎉 Hoàn tất khởi tạo database!');
console.log('');
console.log('📋 Thông tin đăng nhập:');
console.log('   Admin:  admin / admin123');
console.log('   Doctor: doctor1 / doctor123');
console.log('   Nurse:  nurse1 / nurse123');
console.log('');
