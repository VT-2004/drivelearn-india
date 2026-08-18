require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./src/routes/authRoutes');
const testRoutes = require('./src/routes/testRoutes');
const schoolRoutes = require('./src/routes/schoolRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const publicRoutes = require('./src/routes/publicRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const instructorPortalRoutes = require('./src/routes/instructorPortalRoutes');
const updateRoutes = require('./src/routes/updateRoutes');
const availabilityRoutes = require('./src/routes/availabilityRoutes');
const certificateRoutes = require('./src/routes/certificateRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://drivelearn-india.vercel.app'],
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'DriveLearn India API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/schools/courses', courseRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/instructor', instructorPortalRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/certificates', certificateRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
