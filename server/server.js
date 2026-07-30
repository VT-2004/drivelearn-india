require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const testRoutes = require('./src/routes/testRoutes');
const path = require('path');
const schoolRoutes = require('./src/routes/schoolRoutes');


const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/schools', schoolRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'DriveLearn India API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});