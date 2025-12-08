import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3001');

app.use(cors());
app.use(express.json());

// Configuration Paths - Environment aware
const APP_CONFIG = {
    // In development, assume config is in ../config relative to web-dashboard
    configDir: process.env.CONFIG_DIR || path.join(__dirname, '../config'),
    // Fallback to local logs if /var/log is not accessible (dev mode)
    logDir: process.env.LOG_DIR || (fs.existsSync('/var/log/sdwan-traffic-gen') ? '/var/log/sdwan-traffic-gen' : path.join(__dirname, '../logs'))
};

const STATS_FILE = path.join(APP_CONFIG.logDir, 'stats.json');
const APPS_FILE = path.join(APP_CONFIG.configDir, 'applications.txt');
const INTERFACES_FILE = path.join(APP_CONFIG.configDir, 'interfaces.txt');

console.log('Using config:', APP_CONFIG);

// Helper to read file safely
const readFile = (filePath: string) => {
    try {
        if (!fs.existsSync(filePath)) return null;
        return fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err);
        return null;
    }
};

// API: Get Status
app.get('/api/status', (req, res) => {
    // Check if service is running via systemctl
    const check = spawn('systemctl', ['is-active', 'sdwan-traffic-gen']);

    check.stdout.on('data', (data) => {
        const status = data.toString().trim();
        res.json({ status: status === 'active' ? 'running' : 'stopped' });
    });

    check.on('error', () => {
        // Fallback if systemctl not available (e.g. mac/dev)
        res.json({ status: 'unknown', error: 'systemctl not available' });
    });
});

// API: Get Stats
app.get('/api/stats', (req, res) => {
    const content = readFile(STATS_FILE);
    if (!content) return res.json({ error: 'Stats not found' });
    try {
        res.json(JSON.parse(content));
    } catch (e) {
        res.json({ error: 'Invalid JSON' });
    }
});

// API: Get Applications
app.get('/api/config/apps', (req, res) => {
    const content = readFile(APPS_FILE);
    if (!content) return res.json({ error: 'Config not found' });

    const apps = content.split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
            const [domain, weight, endpoint] = line.split('|');
            return { domain, weight: parseInt(weight) || 0, endpoint };
        });

    res.json(apps);
});

// API: Update Application Weight
app.post('/api/config/apps', (req, res) => {
    const { domain, weight } = req.body;
    if (!domain || weight === undefined) return res.status(400).json({ error: 'Missing fields' });

    const content = readFile(APPS_FILE);
    if (!content) return res.status(500).json({ error: 'Read failed' });

    const lines = content.split('\n');
    const newLines = lines.map(line => {
        if (line.startsWith(domain + '|')) {
            const parts = line.split('|');
            parts[1] = weight.toString();
            return parts.join('|');
        }
        return line;
    });

    try {
        // We need sudo to write to /opt usually, this might fail in dev if permissions aren't set
        // For now, we assume user running this has permissions or we are in dev mode
        fs.writeFileSync(APPS_FILE, newLines.join('\n'));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Write failed', details: err });
    }
});

// API: Get Interfaces
app.get('/api/config/interfaces', (req, res) => {
    const content = readFile(INTERFACES_FILE);
    if (!content) return res.json([]);
    const interfaces = content.split('\n').filter(line => line && !line.startsWith('#'));
    res.json(interfaces);
});

// API: Save Interfaces
app.post('/api/config/interfaces', (req, res) => {
    const { interfaces } = req.body;
    if (!Array.isArray(interfaces)) return res.status(400).json({ error: 'Invalid format' });

    try {
        fs.writeFileSync(INTERFACES_FILE, interfaces.join('\n'));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Write failed', details: err });
    }
});

// API: Tail Logs (Simple last 50 lines)
app.get('/api/logs', (req, res) => {
    const logFile = path.join(APP_CONFIG.logDir, 'traffic.log');
    if (!fs.existsSync(logFile)) return res.json({ logs: [] });

    // Use tail command for efficiency
    const tail = spawn('tail', ['-n', '50', logFile]);
    let data = '';

    tail.stdout.on('data', chunk => data += chunk);
    tail.on('close', () => {
        res.json({ logs: data.split('\n').filter(l => l) });
    });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    // Static files
    app.use(express.static(path.join(__dirname, 'dist')));

    // SPA Fallback - Use middleware as last resort
    app.use((req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});
