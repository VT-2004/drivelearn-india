const prisma = require('../utils/prismaClient');

// Helper: get the Instructor record for the logged-in instructor user
const getInstructorRecord = async (userId) => {
  return prisma.instructor.findUnique({ where: { userId } });
};

// INSTRUCTOR: Get all bookings assigned to me
const getMyAssignedBookings = async (req, res) => {
  try {
    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        instructorId: instructor.id,
        status: { in: ['confirmed', 'completed'] },
      },
      include: {
        course: { select: { title: true } },
        learner: { select: { name: true, phone: true } },
        attendance: { orderBy: { date: 'desc' } },
      },
      orderBy: { bookedDate: 'asc' },
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Get assigned bookings error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// INSTRUCTOR: Mark attendance for a booking (creates a new lesson record)
const markAttendance = async (req, res) => {
  try {
    const { bookingId, date, status, notes } = req.body;

    if (!bookingId || !date || !status) {
      return res.status(400).json({ error: 'Booking, date, and status are required' });
    }

    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const booking = await prisma.booking.findUnique({ where: { id: parseInt(bookingId) } });
    if (!booking || booking.instructorId !== instructor.id) {
      return res.status(403).json({ error: 'Not authorized to mark attendance for this booking' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        bookingId: booking.id,
        date: new Date(date),
        status,
        notes: notes || null,
      },
    });

    res.status(201).json({ message: 'Attendance marked', attendance });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// INSTRUCTOR or LEARNER: Get attendance history for a booking
const getBookingAttendance = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: { instructor: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const isOwnLearnerBooking = role === 'learner' && booking.learnerId === userId;
    const isAssignedInstructor = role === 'instructor' && booking.instructor.userId === userId;

    if (!isOwnLearnerBooking && !isAssignedInstructor) {
      return res.status(403).json({ error: 'Not authorized to view this attendance record' });
    }

    const attendance = await prisma.attendance.findMany({
      where: { bookingId: booking.id },
      orderBy: { date: 'desc' },
    });

    res.json({ attendance });
  } catch (error) {
    console.error('Get booking attendance error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// INSTRUCTOR: Mark a booking's course as fully completed
const markBookingComplete = async (req, res) => {
  try {
    const { id } = req.params;

    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const booking = await prisma.booking.findUnique({ where: { id: parseInt(id) } });
    if (!booking || booking.instructorId !== instructor.id) {
      return res.status(403).json({ error: 'Not authorized to update this booking' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Only confirmed bookings can be marked completed' });
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'completed' },
    });

    res.json({ message: 'Course marked as completed', booking: updated });
  } catch (error) {
    console.error('Mark booking complete error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// INSTRUCTOR: Clock in for a lesson today
const clockIn = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const booking = await prisma.booking.findUnique({ where: { id: parseInt(bookingId) } });
    if (!booking || booking.instructorId !== instructor.id) {
      return res.status(403).json({ error: 'Not authorized for this booking' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Check if already clocked in today for this booking
    const existing = await prisma.attendance.findFirst({
      where: { bookingId: booking.id, date: { gte: todayStart, lte: todayEnd } },
    });

    if (existing) {
      if (existing.checkInTime && !existing.checkOutTime) {
        return res.status(409).json({ error: 'Already clocked in - please clock out first' });
      }
      if (existing.checkInTime && existing.checkOutTime) {
        return res.status(409).json({ error: 'Attendance already completed for today' });
      }
    }

    const attendance = existing
      ? await prisma.attendance.update({
          where: { id: existing.id },
          data: { checkInTime: new Date(), status: 'present' },
        })
      : await prisma.attendance.create({
          data: {
            bookingId: booking.id,
            date: new Date(),
            status: 'present',
            checkInTime: new Date(),
          },
        });

    res.status(201).json({ message: 'Clocked in successfully', attendance });
  } catch (error) {
    console.error('Clock in error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// INSTRUCTOR: Clock out of today's lesson
const clockOut = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existing = await prisma.attendance.findFirst({
      where: { bookingId: parseInt(bookingId), date: { gte: todayStart, lte: todayEnd } },
    });

    if (!existing || !existing.checkInTime) {
      return res.status(400).json({ error: 'You must clock in before clocking out' });
    }
    if (existing.checkOutTime) {
      return res.status(409).json({ error: 'Already clocked out for today' });
    }

    const attendance = await prisma.attendance.update({
      where: { id: existing.id },
      data: { checkOutTime: new Date() },
    });

    res.json({ message: 'Clocked out successfully', attendance });
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// INSTRUCTOR: Get calendar view of my attendance across all assigned bookings for a month
const getMyCalendar = async (req, res) => {
  try {
    const { month, year } = req.query; // month: 1-12
    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const records = await prisma.attendance.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        booking: { instructorId: instructor.id },
      },
    });

    // Group by day-of-month: 'present' wins over 'absent' if multiple lessons that day
    const dayMap = {};
    records.forEach((r) => {
      const day = new Date(r.date).getDate();
      if (!dayMap[day] || r.status === 'present') {
        dayMap[day] = r.status;
      }
    });

    res.json({ month: targetMonth, year: targetYear, days: dayMap });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { getMyAssignedBookings, markAttendance, getBookingAttendance, markBookingComplete, clockIn, clockOut, getMyCalendar };