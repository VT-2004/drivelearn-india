const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');

// SIGNUP
const signup = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Basic validation
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const validRoles = ['admin', 'school_owner', 'instructor', 'learner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
      },
    });

    // Don't send password back
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Something went wrong during signup' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Something went wrong during login' });
  }
};

module.exports = { signup, login };
