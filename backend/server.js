import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import landsRoutes from './routes/lands.js';
import farmerRoutes from './routes/farmer.js';
import landownerRoutes from './routes/landowner.js';
import buyerRoutes from './routes/buyer.js';
import adminRoutes from './routes/admin.js';
import irrigationRoutes from './routes/irrigation.js';
import aiRoutes from './routes/ai.js';
import weatherRoutes from './routes/weather.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lands', landsRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/landowner', landownerRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/weather', weatherRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AgriBridge Backend API is healthy and connected' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global 500 Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`🌿 AgriBridge Express server running on port ${PORT}`);
});
