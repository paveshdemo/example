const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');
const seedData = require('./seedAdmin');

// Connect to database
connectDB();

// Seed admin and sample data if needed
seedData().catch(err => {
  console.error('Error seeding data:', err.message);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/purchase-requests', require('./routes/purchaseRequestRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/construction-updates', require('./routes/constructionRoutes'));
app.use('/api/change-requests', require('./routes/changeRequestRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Property Management API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
