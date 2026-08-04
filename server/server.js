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

const app = express();

app.use(cors());
app.use(express.json());
const paymentRoutes = require('./src/routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});