require('express-async-errors');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./modules/auth/auth.routes');
const onboardingRoutes = require('./modules/onboarding/onboarding.routes');
const coursesRoutes = require('./modules/courses/courses.routes');
const subjectsRoutes = require('./modules/subjects/subjects.routes');
const gradesRoutes = require('./modules/grades/grades.routes');
const attendanceRoutes = require('./modules/attendance/attendance.routes');
const tasksRoutes = require('./modules/tasks/tasks.routes');
const predictorRoutes = require('./modules/predictor/predictor.routes');
const notesRoutes = require('./modules/notes/notes.routes');
const resourcesRoutes = require('./modules/resources/resources.routes');
const adminRoutes = require('./modules/admin/admin.routes');

const app = express();

// CORS Middleware — allow configured and local dev frontend origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};
app.use(cors(corsOptions));

// Body & Cookie parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiter for authentication routes (10 req/min per IP as per rules.md §7)
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per `window`
  message: {
    success: false,
    message: 'Too many login/auth requests from this IP, please try again after a minute',
    error: 'TOO_MANY_REQUESTS',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/auth', authLimiter);

// Base health check route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy and running',
    timestamp: new Date().toISOString(),
  });
});

// Mounted API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/courses', coursesRoutes);
app.use('/api/v1/subjects', subjectsRoutes);
app.use('/api/v1/grades', gradesRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/tasks', tasksRoutes);
app.use('/api/v1/predictor', predictorRoutes);
app.use('/api/v1/notes', notesRoutes);
app.use('/api/v1/resources', resourcesRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    error: 'NOT_FOUND',
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
