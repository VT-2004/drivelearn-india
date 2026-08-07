const prisma = require('../utils/prismaClient');

// PUBLIC: Search verified schools, optionally filtered by city
const searchSchools = async (req, res) => {
  try {
    const { city } = req.query;

    const where = {
      verificationStatus: 'verified',
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
    };

    const schools = await prisma.drivingSchool.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        city: true,
        state: true,
        address: true,
        courses: {
          select: { price: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const schoolsWithPricing = schools.map((s) => {
      const prices = s.courses.map((c) => Number(c.price));
      const startingPrice = prices.length > 0 ? Math.min(...prices) : null;
      const avgRating = s.reviews.length > 0
        ? (s.reviews.reduce((sum, r) => sum + r.rating, 0) / s.reviews.length).toFixed(1)
        : null;
      const { courses, reviews, ...rest } = s;
      return { ...rest, startingPrice, courseCount: courses.length, avgRating, reviewCount: reviews.length };
    });

    res.json({ schools: schoolsWithPricing });
  } catch (error) {
    console.error('Search schools error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// PUBLIC: Get a single verified school's full profile
const getSchoolProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const school = await prisma.drivingSchool.findUnique({
      where: { id: parseInt(id) },
      include: {
        courses: true,
        branches: true,
        instructors: {
          include: { user: { select: { name: true } } },
        },
        reviews: {
          include: { learner: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!school || school.verificationStatus !== 'verified') {
      return res.status(404).json({ error: 'School not found' });
    }

    const avgRating = school.reviews.length > 0
      ? (school.reviews.reduce((sum, r) => sum + r.rating, 0) / school.reviews.length).toFixed(1)
      : null;

    res.json({ school: { ...school, avgRating, reviewCount: school.reviews.length } });
  } catch (error) {
    console.error('Get school profile error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { searchSchools, getSchoolProfile };