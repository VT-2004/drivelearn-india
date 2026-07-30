const prisma = require('../utils/prismaClient');

// SCHOOL OWNER: Register a new school
const registerSchool = async (req, res) => {
  try {
    const ownerId = req.user.id; // from auth middleware
    const { name, description, city, state, address } = req.body;

    if (!name || !city || !state || !address) {
      return res.status(400).json({ error: 'Name, city, state, and address are required' });
    }

    // Check if this owner already has a school
    const existing = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (existing) {
      return res.status(409).json({ error: 'You have already registered a school' });
    }

    // documentsUrl - local file path for now (will become S3 URL later)
    const documentsUrl = req.file ? `/uploads/school-documents/${req.file.filename}` : null;

    const school = await prisma.drivingSchool.create({
      data: {
        ownerId,
        name,
        description,
        city,
        state,
        address,
        documentsUrl,
        verificationStatus: 'pending',
      },
    });

    res.status(201).json({
      message: 'School registered successfully. Awaiting verification.',
      school,
    });
  } catch (error) {
    console.error('Register school error:', error);
    res.status(500).json({ error: 'Something went wrong during registration' });
  }
};

// SCHOOL OWNER: Get my own school (with branches)
const getMySchool = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const school = await prisma.drivingSchool.findUnique({
      where: { ownerId },
      include: { branches: true },
    });

    if (!school) {
      return res.status(404).json({ error: 'No school registered yet' });
    }

    res.json({ school });
  } catch (error) {
    console.error('Get my school error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// ADMIN: Get all schools, optionally filtered by status
const getAllSchools = async (req, res) => {
  try {
    const { status } = req.query; // ?status=pending

    const where = status ? { verificationStatus: status } : {};

    const schools = await prisma.drivingSchool.findMany({
      where,
      include: { owner: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ schools });
  } catch (error) {
    console.error('Get all schools error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// ADMIN: Approve a school
const approveSchool = async (req, res) => {
  try {
    const { id } = req.params;

    const school = await prisma.drivingSchool.update({
      where: { id: parseInt(id) },
      data: { verificationStatus: 'verified' },
    });

    res.json({ message: 'School approved', school });
  } catch (error) {
    console.error('Approve school error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// ADMIN: Reject a school
const rejectSchool = async (req, res) => {
  try {
    const { id } = req.params;

    const school = await prisma.drivingSchool.update({
      where: { id: parseInt(id) },
      data: { verificationStatus: 'rejected' },
    });

    res.json({ message: 'School rejected', school });
  } catch (error) {
    console.error('Reject school error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = {
  registerSchool,
  getMySchool,
  getAllSchools,
  approveSchool,
  rejectSchool,
};
