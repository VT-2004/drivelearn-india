const prisma = require('../utils/prismaClient');
const { sendEmail } = require('../utils/emailService');
const {
  schoolPendingEmail,
  schoolVerifiedEmail,
  schoolRejectedEmail,
  schoolWarningEmail,
  schoolSuspendedEmail,
  schoolReinstatedEmail,
} = require('../utils/emailTemplates');

// SCHOOL OWNER: Register a new school
const registerSchool = async (req, res) => {
  try {
    const ownerId = req.user.id; // from auth middleware
    const { name, description, city, state, address, latitude, longitude } = req.body;

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
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        documentsUrl,
        verificationStatus: 'pending',
      },
    });

    res.status(201).json({
      message: 'School registered successfully. Awaiting verification.',
      school,
    });

    // Send pending confirmation email (non-blocking, wrapped separately so any
    // failure here never tries to send a second response back to the client)
    try {
      const owner = await prisma.user.findUnique({ where: { id: ownerId } });
      if (owner) {
        const emailContent = schoolPendingEmail({ ownerName: owner.name, schoolName: school.name });
        sendEmail({ to: owner.email, ...emailContent });
      }
    } catch (emailErr) {
      console.error('Failed to send pending email (non-blocking):', emailErr.message);
    }
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
      include: {
        branches: true,
        reviews: {
          include: {
            learner: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
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
      include: {
        owner: { select: { name: true, email: true, phone: true } },
        courses: { select: { title: true } },
      },
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
      include: { owner: true },
    });

    res.json({ message: 'School approved', school });

    // Send welcome/verified email (non-blocking, wrapped separately)
    try {
      const emailContent = schoolVerifiedEmail({ ownerName: school.owner.name, schoolName: school.name });
      sendEmail({ to: school.owner.email, ...emailContent });
    } catch (emailErr) {
      console.error('Failed to send verified email (non-blocking):', emailErr.message);
    }
  } catch (error) {
    console.error('Approve school error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// ADMIN: Reject a school
const rejectSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const school = await prisma.drivingSchool.update({
      where: { id: parseInt(id) },
      data: { verificationStatus: 'rejected' },
      include: { owner: true },
    });

    res.json({ message: 'School rejected successfully', school });

    // Send rejection email notification to owner (non-blocking)
    try {
      if (school.owner?.email) {
        const emailContent = schoolRejectedEmail({
          ownerName: school.owner.name,
          schoolName: school.name,
          reason: reason || 'Submitted RTO documentation was insufficient or did not match registered details.',
        });
        sendEmail({ to: school.owner.email, ...emailContent });
      }
    } catch (emailErr) {
      console.error('Failed to send rejection email (non-blocking):', emailErr.message);
    }
  } catch (error) {
    console.error('Reject school error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// SCHOOL OWNER: Update school profile
const updateSchool = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { name, description, city, state, address, latitude, longitude } = req.body;

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
        latitude: latitude !== undefined ? parseFloat(latitude) : school.latitude,
        longitude: longitude !== undefined ? parseFloat(longitude) : school.longitude,
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

// SCHOOL OWNER: Cancel a pending (or rejected) school registration
const cancelSchoolRegistration = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school) {
      return res.status(404).json({ error: 'No school registered yet' });
    }

    if (school.verificationStatus === 'verified') {
      return res.status(400).json({
        error: 'Cannot cancel a verified school. Please contact support if you need to remove your listing.',
      });
    }

    // Clean up dependent records first (no cascade delete configured in schema)
    await prisma.course.deleteMany({ where: { schoolId: school.id } });
    await prisma.branch.deleteMany({ where: { schoolId: school.id } });
    await prisma.instructor.deleteMany({ where: { schoolId: school.id } });
    await prisma.subscription.deleteMany({ where: { schoolId: school.id } });

    await prisma.drivingSchool.delete({ where: { id: school.id } });

    res.json({ message: 'School registration cancelled successfully' });
  } catch (error) {
    console.error('Cancel school registration error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// ADMIN: Send formal warning notice to a driving school
const warnSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Warning message is required' });
    }

    const school = await prisma.drivingSchool.findUnique({
      where: { id: parseInt(id) },
      include: { owner: true },
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Save notification to database for the school owner
    const notification = await prisma.notification.create({
      data: {
        userId: school.ownerId,
        schoolId: school.id,
        title: subject || '⚠️ Official Compliance Warning Notice',
        message,
        type: 'warning',
      },
    });

    // Send email notification to school owner
    try {
      if (school.owner?.email) {
        const emailContent = schoolWarningEmail({
          ownerName: school.owner.name,
          schoolName: school.name,
          subject,
          message,
        });
        sendEmail({ to: school.owner.email, ...emailContent });
      }
    } catch (emailErr) {
      console.error('Failed to send warning email:', emailErr.message);
    }

    res.json({ message: 'Warning notice issued and dispatched successfully', notification });
  } catch (error) {
    console.error('Warn school error:', error);
    res.status(500).json({ error: 'Failed to issue warning notice' });
  }
};

// ADMIN: Suspend a verified driving school
const suspendSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const school = await prisma.drivingSchool.update({
      where: { id: parseInt(id) },
      data: {
        verificationStatus: 'suspended',
        suspensionReason: reason || 'Temporary suspension due to compliance review or safety complaint.',
      },
      include: { owner: true },
    });

    // Create suspension notification in DB
    await prisma.notification.create({
      data: {
        userId: school.ownerId,
        schoolId: school.id,
        title: '🛑 Academy License Temporarily Suspended',
        message: reason || 'Your academy license has been temporarily suspended pending compliance review.',
        type: 'suspension',
      },
    });

    // Send suspension email
    try {
      if (school.owner?.email) {
        const emailContent = schoolSuspendedEmail({
          ownerName: school.owner.name,
          schoolName: school.name,
          reason,
        });
        sendEmail({ to: school.owner.email, ...emailContent });
      }
    } catch (emailErr) {
      console.error('Failed to send suspension email:', emailErr.message);
    }

    res.json({ message: 'Driving school suspended successfully', school });
  } catch (error) {
    console.error('Suspend school error:', error);
    res.status(500).json({ error: 'Failed to suspend school' });
  }
};

// ADMIN: Unsuspend / Reinstate a suspended driving school
const unsuspendSchool = async (req, res) => {
  try {
    const { id } = req.params;

    const school = await prisma.drivingSchool.update({
      where: { id: parseInt(id) },
      data: {
        verificationStatus: 'verified',
        suspensionReason: null,
      },
      include: { owner: true },
    });

    // Create reinstatement notification in DB
    await prisma.notification.create({
      data: {
        userId: school.ownerId,
        schoolId: school.id,
        title: '✓ Academy License Reinstated & Verified',
        message: 'Your driving academy has been reinstated to full Verified RTO Partner status.',
        type: 'success',
      },
    });

    // Send reinstatement email
    try {
      if (school.owner?.email) {
        const emailContent = schoolReinstatedEmail({
          ownerName: school.owner.name,
          schoolName: school.name,
        });
        sendEmail({ to: school.owner.email, ...emailContent });
      }
    } catch (emailErr) {
      console.error('Failed to send reinstated email:', emailErr.message);
    }

    res.json({ message: 'Driving school reinstated successfully', school });
  } catch (error) {
    console.error('Unsuspend school error:', error);
    res.status(500).json({ error: 'Failed to reinstate school' });
  }
};

// SCHOOL OWNER: Get all notifications & compliance notices
const getSchoolNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Get school notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// SCHOOL OWNER: Mark notification as read
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.updateMany({
      where: { id: parseInt(id), userId },
      data: { isRead: true },
    });

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

// SCHOOL OWNER: Get all reviews for my school
const getMySchoolReviews = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school) {
      return res.status(404).json({ error: 'No school registered yet' });
    }

    const reviews = await prisma.review.findMany({
      where: { schoolId: school.id },
      include: {
        learner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reviews });
  } catch (error) {
    console.error('Get my school reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

module.exports = {
  registerSchool,
  getMySchool,
  getAllSchools,
  approveSchool,
  rejectSchool,
  warnSchool,
  suspendSchool,
  unsuspendSchool,
  updateSchool,
  getSchoolStats,
  cancelSchoolRegistration,
  getSchoolNotifications,
  markNotificationRead,
  getMySchoolReviews,
};