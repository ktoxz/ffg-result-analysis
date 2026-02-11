const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const resultsRoutes = require('./routes/results');
const patientsRoutes = require('./routes/patients');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session configuration
app.use(session({
    secret: 'ffg-result-analysis-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Determine static folder - try client/dist first (production), then client (dev)
const clientDistPath = path.join(__dirname, '../client/dist');
const clientPath = path.join(__dirname, '../client');
const staticPath = fs.existsSync(clientDistPath) ? clientDistPath : clientPath;

// Serve static files
app.use(express.static(staticPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/patients', patientsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Client not built. Run: npm run client:build');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Đã xảy ra lỗi server!' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    console.log(`📁 Static files: ${staticPath}`);
});
