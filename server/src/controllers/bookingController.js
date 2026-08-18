const prisma = require('../utils/prismaClient');
const { sendEmail } = require('../utils/emailService');
const { bookingCancelledEmail } = require('../utils/emailTemplates');

// LEARNER: Create a booking
const createBooking = async (req, res) => {
  try {
    const learnerId = req.user.id;
    const { courseId, slotId } = req.body;

    if (!courseId || !slotId) {
      return res.status(400).json({ error: 'Course and a selected time slot are required' });
    }

    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
      include: { school: true },
    });

    if (!course || course.school.verificationStatus !== 'verified') {
      return res.status(404).json({ error: 'Course not found or unavailable' });
    }

    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: parseInt(slotId) },
      include: { instructor: true },
    });

    if (!slot) {
      return res.status(404).json({ error: 'Selected time slot not found' });
    }
    if (slot.isBooked) {
      return res.status(409).json({ error: 'This slot was just booked by someone else. Please pick another.' });
    }
    if (slot.instructor.schoolId !== course.schoolId) {
      return res.status(400).json({ error: 'This instructor does not belong to the selected course\'s school' });
    }

    // Atomic transaction: lock the slot and create the booking together,
    // so two learners can never both book the same slot in a race condition
    const booking = await prisma.$transaction(async (tx) => {
      const freshSlot = await tx.availabilitySlot.findUnique({ where: { id: slot.id } });
      if (freshSlot.isBooked) {
        throw new Error('SLOT_ALREADY_BOOKED');
      }

      const newBooking = await tx.booking.create({
        data: {
          learnerId,
          courseId: course.id,
          instructorId: slot.instructorId,
          bookedDate: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotId: slot.id,
          status: 'pending',
        },
        include: {
          course: { include: { school: true } },
          instructor: { include: { user: { select: { name: true } } } },
        },
      });

      await tx.availabilitySlot.update({
        where: { id: slot.id },
        data: { isBooked: true },
      });

      return newBooking;
    });

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    if (error.message === 'SLOT_ALREADY_BOOKED') {
      return res.status(409).json({ error: 'This slot was just booked by someone else. Please pick another.' });
    }
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
      include: {
        course: { include: { school: true } },
        learner: true,
      },
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

    // Free up the time slot so it can be booked again
    if (booking.slotId) {
      await prisma.availabilitySlot.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });
    }

    res.json({ message: 'Booking cancelled', booking: updated });

    // Send cancellation email (non-blocking, wrapped separately)
    try {
      const emailContent = bookingCancelledEmail({
        learnerName: booking.learner.name,
        courseName: booking.course.title,
        schoolName: booking.course.school.name,
        bookedDate: new Date(booking.bookedDate).toLocaleDateString('en-IN'),
        cancelledBy: role,
      });
      sendEmail({ to: booking.learner.email, ...emailContent });
    } catch (emailErr) {
      console.error('Failed to send cancellation email (non-blocking):', emailErr.message);
    }
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// LEARNER: Get calendar view of my attendance across all bookings for a month
const getMyCalendar = async (req, res) => {
  try {
    const learnerId = req.user.id;
    const { month, year } = req.query;

    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const records = await prisma.attendance.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        booking: { learnerId },
      },
    });

    const dayMap = {};
    records.forEach((r) => {
      const day = new Date(r.date).getDate();
      if (!dayMap[day] || r.status === 'present') {
        dayMap[day] = r.status;
      }
    });

    res.json({ month: targetMonth, year: targetYear, days: dayMap });
  } catch (error) {
    console.error('Get learner calendar error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { createBooking, getMyBookings, getSchoolBookings, cancelBooking, getMyCalendar };