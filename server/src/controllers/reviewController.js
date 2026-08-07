const prisma = require('../utils/prismaClient');

// LEARNER: Leave a review for a school (only if they've completed a course there)
const createReview = async (req, res) => {
  try {
    const learnerId = req.user.id;
    const { schoolId, rating, comment } = req.body;

    if (!schoolId || !rating) {
      return res.status(400).json({ error: 'School and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Confirm the learner has at least one completed booking with this school
    const completedBooking = await prisma.booking.findFirst({
      where: {
        learnerId,
        status: 'completed',
        course: { schoolId: parseInt(schoolId) },
      },
    });

    if (!completedBooking) {
      return res.status(403).json({ error: 'You can only review a school after completing a course with them' });
    }

    // Prevent duplicate reviews for the same school by the same learner
    const existingReview = await prisma.review.findFirst({
      where: { learnerId, schoolId: parseInt(schoolId) },
    });

    if (existingReview) {
      return res.status(409).json({ error: 'You have already reviewed this school' });
    }

    const review = await prisma.review.create({
      data: {
        learnerId,
        schoolId: parseInt(schoolId),
        rating: parseInt(rating),
        comment: comment || null,
      },
    });

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// LEARNER: Check which of their completed bookings still need a review
const getReviewableSchools = async (req, res) => {
  try {
    const learnerId = req.user.id;

    const completedBookings = await prisma.booking.findMany({
      where: { learnerId, status: 'completed' },
      include: { course: { include: { school: true } } },
    });

    const existingReviews = await prisma.review.findMany({
      where: { learnerId },
      select: { schoolId: true },
    });
    const reviewedSchoolIds = new Set(existingReviews.map((r) => r.schoolId));

    const reviewable = [];
    const seenSchoolIds = new Set();
    for (const b of completedBookings) {
      const schoolId = b.course.school.id;
      if (!reviewedSchoolIds.has(schoolId) && !seenSchoolIds.has(schoolId)) {
        seenSchoolIds.add(schoolId);
        reviewable.push({ schoolId, schoolName: b.course.school.name });
      }
    }

    res.json({ reviewable });
  } catch (error) {
    console.error('Get reviewable schools error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { createReview, getReviewableSchools };
