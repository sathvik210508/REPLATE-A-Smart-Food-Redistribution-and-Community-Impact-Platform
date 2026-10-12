import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import donationsRoutes from './routes/donationsRoutes.js';
import requestsRoutes from './routes/requestsRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationsRoutes from './routes/notificationsRoutes.js';
import organizationsRoutes from './routes/organizationsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import systemRoutes from './routes/systemRoutes.js';

const app = express();

app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production' && req.path.startsWith('/api')) {
    console.log(`[API ${req.method}] ${req.path}`);
  }
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/system', systemRoutes);

// Root health
app.get('/api', (req, res) => {
  res.json({
    message: 'REPLATE Food Redistribution API is operational.',
    version: '1.0.0',
    hackathon: 'IETE IDEATHON 2026',
    team: 'Team NovaNex (CBIT Hyderabad)',
  });
});

// 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[REPLATE API Error]:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
});

export default app;
