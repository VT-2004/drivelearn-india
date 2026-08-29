const prisma = require('../utils/prismaClient');

// Haversine formula - distance in km between two lat/lng points
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// PUBLIC: Search verified schools - by city text, or by lat/lng ("near me")
const searchSchools = async (req, res) => {
  try {
    const { city, lat, lng, radiusKm } = req.query;

    const where = {
      verificationStatus: 'verified',
      ...(city && !lat && { city: { contains: city, mode: 'insensitive' } }),
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
        latitude: true,
        longitude: true,
        courses: {
          select: { price: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let schoolsWithPricing = schools.map((s) => {
      const prices = s.courses.map((c) => Number(c.price));
      const startingPrice = prices.length > 0 ? Math.min(...prices) : null;
      const avgRating = s.reviews.length > 0
        ? (s.reviews.reduce((sum, r) => sum + r.rating, 0) / s.reviews.length).toFixed(1)
        : null;
      const { courses, reviews, ...rest } = s;
      return { ...rest, startingPrice, courseCount: courses.length, avgRating, reviewCount: reviews.length };
    });

    // "Near me" mode: filter + sort by distance if lat/lng provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radius = radiusKm ? parseFloat(radiusKm) : 50; // default 50km radius

      schoolsWithPricing = schoolsWithPricing
        .filter((s) => s.latitude != null && s.longitude != null)
        .map((s) => ({
          ...s,
          distanceKm: parseFloat(getDistanceKm(userLat, userLng, s.latitude, s.longitude).toFixed(1)),
        }))
        .filter((s) => s.distanceKm <= radius)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const school = await prisma.drivingSchool.findUnique({
      where: { id: parseInt(id) },
      include: {
        courses: {
          orderBy: { id: 'asc' },
        },
        branches: true,
        vehicles: true,
        instructors: {
          include: {
            user: { select: { name: true, phone: true } },
            availabilitySlots: {
              where: { isBooked: false, date: { gte: today } },
              orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
            },
          },
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