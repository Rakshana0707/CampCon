const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const registrationRoutes = require('./routes/registration.routes');
const notificationRoutes = require('./routes/notification.routes');
const certificateRoutes = require('./routes/certificate.routes');
const adminRoutes = require('./routes/admin.routes');
const organizerRoutes = require('./routes/organizer.routes');

const app = express();

// 1. Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Disabled to avoid breaking frontend/Vite without testing
}));

// Use morgan for HTTP request logging (safely excludes request bodies/passwords)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
})); // Enable restricted Cross-Origin Resource Sharing for the React frontend
app.use(express.json()); // Parse incoming JSON payloads

// 2. Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/organizers', organizerRoutes);

// 3. Centralized Error Handling
app.use(errorHandler);

module.exports = app;
