const prisma = require('../utils/prismaClient');

// LEARNER: Create a booking
const createBooking = async (req, res) => {
  try {
    const learnerId = req.user.id;
    const { courseId, instructorId, bookedDate } = req.body;

    if (!courseId || !bookedDate) {
      return res.status(400).json({ error: 'Course and booking date are required' });
    }

    // Confirm course exists and belongs to a verified school
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
      include: { school: true },
    });

    if (!course || course.school.verificationStatus !== 'verified') {
      return res.status(404).json({ error: 'Course not found or unavailable' });
    }

    // Determine which instructor to assign
    let finalInstructorId = instructorId ? parseInt(instructorId) : null;

    if (!finalInstructorId) {
      // Auto-assign the first available instructor at this school
      const firstInstructor = await prisma.instructor.findFirst({
        where: { schoolId: course.schoolId },
      });
      if (!firstInstructor) {
        return res.status(400).json({ error: 'This school has no instructors available yet' });
      }
      finalInstructorId = firstInstructor.id;
    } else {
      // Confirm the chosen instructor actually belongs to this school
      const instructor = await prisma.instructor.findUnique({ where: { id: finalInstructorId } });
      if (!instructor || instructor.schoolId !== course.schoolId) {
        return res.status(400).json({ error: 'Invalid instructor for this school' });
      }
    }

    const parsedDate = new Date(bookedDate);

    // Prevent double-booking: same instructor, same date, not cancelled
    const conflict = await prisma.booking.findFirst({
      where: {
        instructorId: finalInstructorId,
        bookedDate: parsedDate,
        status: { in: ['pending', 'confirmed'] },
      },
    });

    if (conflict) {
      return res.status(409).json({ error: 'This instructor is already booked on that date. Please choose a different date.' });
    }

    const booking = await prisma.booking.create({
      data: {
        learnerId,
        courseId: course.id,
        instructorId: finalInstructorId,
        bookedDate: parsedDate,
        status: 'pending',
      },
      include: {
        course: { include: { school: true } },
        instructor: { include: { user: { select: { name: true } } } },
      },
    });

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// LEARNER: Get my bookings
const getMyBookings = async (req, res) => {
  try {
    const learnerId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: { learnerId },
      include: {
        course: { include: { school: { select: { name: true, city: true } } } },
        instructor: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// SCHOOL OWNER: Get all bookings for my school
const getSchoolBookings = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school) {
      return res.status(404).json({ error: 'No school registered yet' });
    }

    const bookings = await prisma.booking.findMany({
      where: { course: { schoolId: school.id } },
      include: {
        course: { select: { title: true, price: true } },
        learner: { select: { name: true, email: true, phone: true } },
        instructor: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Get school bookings error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// LEARNER or SCHOOL OWNER: Cancel a booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: { course: { include: { school: true } } },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Authorization: learner can cancel their own booking; school owner can cancel bookings for their school
    const isOwnLearnerBooking = role === 'learner' && booking.learnerId === userId;
    const isOwnSchoolBooking = role === 'school_owner' && booking.course.school.ownerId === userId;

    if (!isOwnLearnerBooking && !isOwnSchoolBooking) {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }

    const updated = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: 'cancelled' },
    });

    res.json({ message: 'Booking cancelled', booking: updated });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { createBooking, getMyBookings, getSchoolBookings, cancelBooking };
