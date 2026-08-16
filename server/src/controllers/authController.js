const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const prisma = require('../utils/prismaClient');
const { isPasswordStrong, passwordStrengthMessage, isEmailDomainValid } = require('../utils/validators');
const { sendEmail } = require('../utils/emailService');
const { welcomeEmail } = require('../utils/emailTemplates');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    // Password strength check
    if (!isPasswordStrong(password)) {
      return res.status(400).json({ error: passwordStrengthMessage });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Real-time check that the email's domain can actually receive mail
    const emailIsValid = await isEmailDomainValid(email);
    if (!emailIsValid) {
      return res.status(400).json({ error: 'Please use a real, valid email address' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user - learners get a ₹10 signup bonus credited to their wallet
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
        walletBalance: role === 'learner' ? 10 : 0,
      },
    });

    // Don't send password back
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: role === 'learner'
        ? 'Signup successful! ₹10 welcome bonus added to your wallet.'
        : 'Signup successful!',
      user: userWithoutPassword,
    });

    // Send welcome email (non-blocking, wrapped separately)
    try {
      const emailContent = welcomeEmail({ name: newUser.name, role: newUser.role });
      sendEmail({ to: newUser.email, ...emailContent });
    } catch (emailErr) {
      console.error('Failed to send welcome email (non-blocking):', emailErr.message);
    }
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

// GET CURRENT USER (fresh data, e.g. for up-to-date wallet balance)
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// GOOGLE SIGN-IN (login if account exists, otherwise creates a new learner account)
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    // Verify the token with Google - confirms it's genuine and reads the payload
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Could not retrieve email from Google account' });
    }

    // Check if a user already exists with this email
    let user = await prisma.user.findUnique({ where: { email } });
    let isNewUser = false;

    if (user) {
      // Existing account - link googleId if not already linked
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      }
    } else {
      // New account - Google sign-in creates a Learner account by default.
      // School owners/instructors need role-specific onboarding, so they
      // should use the regular email signup form instead.
      isNewUser = true;
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          password: hashedPassword,
          phone: '',
          role: 'learner',
          googleId,
          walletBalance: 10,
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: isNewUser ? 'Account created with Google. ₹10 welcome bonus added!' : 'Login successful',
      token,
      user: userWithoutPassword,
      isNewUser,
    });

    if (isNewUser) {
      try {
        const emailContent = welcomeEmail({ name: user.name, role: user.role });
        sendEmail({ to: user.email, ...emailContent });
      } catch (emailErr) {
        console.error('Failed to send welcome email (non-blocking):', emailErr.message);
      }
    }
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Google sign-in failed. Please try again.' });
  }
};

// UPDATE PROFILE (name, phone - any authenticated user)
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name || undefined,
        phone: phone || undefined,
      },
    });

    const { password: _, ...userWithoutPassword } = updated;
    res.json({ message: 'Profile updated successfully', user: userWithoutPassword });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// CHANGE PASSWORD (any authenticated user)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (!isPasswordStrong(newPassword)) {
      return res.status(400).json({ error: passwordStrengthMessage });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { signup, login, getMe, googleAuth, updateProfile, changePassword };