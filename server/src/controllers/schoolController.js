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

// SCHOOL OWNER: Update school profile
const updateSchool = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { name, description, city, state, address } = req.body;

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school) {
      return res.status(404).json({ error: 'No school registered yet' });
    }

    const updated = await prisma.drivingSchool.update({
      where: { ownerId },
      data: {
        name: name ?? school.name,
        description: description ?? school.description,
        city: city ?? school.city,
        state: state ?? school.state,
        address: address ?? school.address,
      },
    });

    res.json({ message: 'School profile updated', school: updated });
  } catch (error) {
    console.error('Update school error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// SCHOOL OWNER: Get dashboard stats overview
const getSchoolStats = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school) {
      return res.status(404).json({ error: 'No school registered yet' });
    }

    const [branchCount, instructorCount, courseCount, bookingCount] = await Promise.all([
      prisma.branch.count({ where: { schoolId: school.id } }),
      prisma.instructor.count({ where: { schoolId: school.id } }),
      prisma.course.count({ where: { schoolId: school.id } }),
      prisma.booking.count({
        where: { course: { schoolId: school.id } },
      }),
    ]);

    res.json({
      stats: {
        branches: branchCount,
        instructors: instructorCount,
        courses: courseCount,
        bookings: bookingCount,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = {
  registerSchool,
  getMySchool,
  getAllSchools,
  approveSchool,
  rejectSchool,
  updateSchool,
  getSchoolStats,
};