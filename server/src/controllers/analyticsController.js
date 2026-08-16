const prisma = require('../utils/prismaClient');

// ADMIN: Platform-wide analytics
const getAdminAnalytics = async (req, res) => {
  try {
    const [
      totalSchools,
      verifiedSchools,
      pendingSchools,
      totalLearners,
      totalInstructors,
      totalBookings,
      confirmedBookings,
      activeSubscriptions,
      payments,
    ] = await Promise.all([
      prisma.drivingSchool.count(),
      prisma.drivingSchool.count({ where: { verificationStatus: 'verified' } }),
      prisma.drivingSchool.count({ where: { verificationStatus: 'pending' } }),
      prisma.user.count({ where: { role: 'learner' } }),
      prisma.user.count({ where: { role: 'instructor' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: { in: ['confirmed', 'completed'] } } }),
      prisma.subscription.count({ where: { status: 'active', endDate: { gt: new Date() } } }),
      prisma.payment.findMany({ where: { status: 'success' }, select: { amount: true } }),
    ]);

    const totalCourseRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Top cities by number of schools
    const schoolsByCity = await prisma.drivingSchool.groupBy({
      by: ['city'],
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 5,
    });

    res.json({
      analytics: {
        totalSchools,
        verifiedSchools,
        pendingSchools,
        totalLearners,
        totalInstructors,
        totalBookings,
        confirmedBookings,
        activeSubscriptions,
        totalCourseRevenue,
        topCities: schoolsByCity.map((c) => ({ city: c.city, count: c._count.city })),
      },
    });
  } catch (error) {
    console.error('Get admin analytics error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// SCHOOL OWNER: School-specific analytics
const getSchoolAnalytics = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school) {
      return res.status(404).json({ error: 'No school registered yet' });
    }

    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      payments,
      reviews,
    ] = await Promise.all([
      prisma.booking.count({ where: { course: { schoolId: school.id } } }),
      prisma.booking.count({ where: { course: { schoolId: school.id }, status: 'pending' } }),
      prisma.booking.count({ where: { course: { schoolId: school.id }, status: 'confirmed' } }),
      prisma.booking.count({ where: { course: { schoolId: school.id }, status: 'completed' } }),
      prisma.booking.count({ where: { course: { schoolId: school.id }, status: 'cancelled' } }),
      prisma.payment.findMany({
        where: { status: 'success', booking: { course: { schoolId: school.id } } },
        select: { amount: true },
      }),
      prisma.review.findMany({ where: { schoolId: school.id }, select: { rating: true } }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    // Most popular course by booking count
    const courseBookingCounts = await prisma.booking.groupBy({
      by: ['courseId'],
      where: { course: { schoolId: school.id } },
      _count: { courseId: true },
      orderBy: { _count: { courseId: 'desc' } },
      take: 3,
    });

    const courseIds = courseBookingCounts.map((c) => c.courseId);
    const courses = await prisma.course.findMany({ where: { id: { in: courseIds } } });
    const popularCourses = courseBookingCounts.map((c) => ({
      title: courses.find((course) => course.id === c.courseId)?.title || 'Unknown',
      bookings: c._count.courseId,
    }));

    res.json({
      analytics: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
        avgRating,
        reviewCount: reviews.length,
        popularCourses,
      },
    });
  } catch (error) {
    console.error('Get school analytics error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// ADMIN: Full detail view for a single school (registration info, stats, reviews)
const getSchoolDetailForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = parseInt(id);

    const school = await prisma.drivingSchool.findUnique({
      where: { id: schoolId },
      include: {
        owner: { select: { name: true, email: true, phone: true, createdAt: true } },
        branches: true,
        instructors: { include: { user: { select: { name: true, email: true } } } },
        courses: true,
        subscriptions: { orderBy: { endDate: 'desc' } },
        reviews: { include: { learner: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const [enrolledLearnersResult, payments] = await Promise.all([
      prisma.booking.findMany({
        where: { course: { schoolId }, status: { in: ['confirmed', 'completed'] } },
        select: { learnerId: true },
        distinct: ['learnerId'],
      }),
      prisma.payment.findMany({
        where: { status: 'success', booking: { course: { schoolId } } },
        select: { amount: true },
      }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const avgRating = school.reviews.length > 0
      ? (school.reviews.reduce((sum, r) => sum + r.rating, 0) / school.reviews.length).toFixed(1)
      : null;

    res.json({
      school,
      stats: {
        enrolledLearners: enrolledLearnersResult.length,
        totalRevenue,
        avgRating,
        reviewCount: school.reviews.length,
        totalBranches: school.branches.length,
        totalInstructors: school.instructors.length,
        totalCourses: school.courses.length,
      },
    });
  } catch (error) {
    console.error('Get school detail error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// ADMIN: Get all users across every role, with role-specific context
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        walletBalance: true,
        createdAt: true,
        drivingSchool: { select: { name: true, verificationStatus: true } },
        instructor: { select: { specialization: true, school: { select: { name: true } } } },
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { getAdminAnalytics, getSchoolAnalytics, getSchoolDetailForAdmin, getAllUsers };