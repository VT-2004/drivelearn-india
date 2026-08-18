const prisma = require('../utils/prismaClient');
const { sendEmail } = require('../utils/emailService');
const { courseCompletedCertificateEmail } = require('../utils/emailTemplates');

// Helper: get the Instructor record for the logged-in instructor user
const getInstructorRecord = async (userId) => {
  return prisma.instructor.findUnique({ where: { userId } });
};

// INSTRUCTOR: Get list of distinct courses I'm teaching, with student counts
const getMyCourses = async (req, res) => {
  try {
    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const bookings = await prisma.booking.findMany({
      where: { instructorId: instructor.id },
      include: {
        course: { select: { id: true, title: true, durationDays: true, school: { select: { name: true } } } },
      },
    });

    const courseMap = {};
    bookings.forEach((b) => {
      const cid = b.course.id;
      if (!courseMap[cid]) {
        courseMap[cid] = {
          id: cid,
          title: b.course.title,
          durationDays: b.course.durationDays,
          schoolName: b.course.school.name,
          totalStudents: 0,
          ongoingStudents: 0,
          completedStudents: 0,
        };
      }
      courseMap[cid].totalStudents += 1;
      if (b.status === 'confirmed') courseMap[cid].ongoingStudents += 1;
      if (b.status === 'completed') courseMap[cid].completedStudents += 1;
    });

    res.json({ courses: Object.values(courseMap) });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// INSTRUCTOR: Get students (bookings) for a specific course I teach, optionally filtered by status
const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status } = req.query; // 'pending' | 'confirmed' | 'completed' | 'cancelled' | undefined (=all)

    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const where = {
      instructorId: instructor.id,
      courseId: parseInt(courseId),
      ...(status && { status }),
    };

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        course: { select: { title: true } },
        learner: { select: { name: true, phone: true, email: true, createdAt: true } },
        attendance: { orderBy: { date: 'desc' } },
      },
      orderBy: { bookedDate: 'asc' },
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Get course students error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
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
        status: { in: ['confirmed', 'completed', 'pending'] },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            durationDays: true,
            school: {
              select: {
                id: true,
                name: true,
                city: true,
                address: true,
                vehicles: true,
              },
            },
          },
        },
        learner: { select: { id: true, name: true, phone: true, email: true, createdAt: true } },
        attendance: { orderBy: { date: 'desc' } },
        updates: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
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

    // Check if total attended sessions now fulfills the course duration
    if (status === 'present') {
      try {
        const allPresentAttendance = await prisma.attendance.findMany({
          where: { bookingId: booking.id, status: 'present' },
        });
        const course = await prisma.course.findUnique({ where: { id: booking.courseId } });

        if (course && allPresentAttendance.length >= course.durationDays && booking.status !== 'completed') {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'completed' },
          });

          const certificateId = `DLI-RTO-${new Date().getFullYear()}-${String(booking.id).padStart(6, '0')}`;

          // Create notification for learner
          await prisma.notification.create({
            data: {
              userId: booking.learnerId,
              schoolId: course.schoolId,
              title: '🎓 Congratulations! Your Driving Certificate is Ready',
              message: `You have completed all ${course.durationDays} practical sessions for "${course.title}". Your verified digital certificate (${certificateId}) is now available for download!`,
              type: 'certificate',
            },
          });

          // Send congratulatory certificate email
          const fullBooking = await prisma.booking.findUnique({
            where: { id: booking.id },
            include: {
              learner: true,
              course: { include: { school: true } },
              instructor: { include: { user: true } },
            },
          });

          if (fullBooking?.learner?.email) {
            const mailContent = courseCompletedCertificateEmail({
              learnerName: fullBooking.learner.name,
              courseName: fullBooking.course.title,
              schoolName: fullBooking.course.school.name,
              instructorName: fullBooking.instructor?.user?.name || 'Authorized Instructor',
              certificateId,
            });
            sendEmail({ to: fullBooking.learner.email, ...mailContent });
          }
        }
      } catch (completionErr) {
        console.error('Course completion trigger error:', completionErr);
      }
    }

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
    const { month, year, courseId } = req.query; // month: 1-12
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
        booking: {
          instructorId: instructor.id,
          ...(courseId && { courseId: parseInt(courseId) }),
        },
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

// INSTRUCTOR: Get my workplace info - always available, even with zero students assigned yet
const getMyWorkplace = async (req, res) => {
  try {
    const instructor = await prisma.instructor.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        school: {
          include: {
            owner: { select: { name: true, email: true, phone: true } },
            courses: { select: { id: true, title: true, durationDays: true } },
            vehicles: true,
          },
        },
      },
    });

    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    res.json({
      workplace: {
        school: instructor.school,
        schoolName: instructor.school?.name,
        description: instructor.school?.description,
        city: instructor.school?.city,
        state: instructor.school?.state,
        address: instructor.school?.address,
        owner: instructor.school?.owner,
        vehicles: instructor.school?.vehicles || [],
        specialization: instructor.specialization,
        experienceYears: instructor.experienceYears,
        allCourses: instructor.school?.courses || [],
      },
    });
  } catch (error) {
    console.error('Get my workplace error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { getMyAssignedBookings, markAttendance, getBookingAttendance, markBookingComplete, clockIn, clockOut, getMyCalendar, getMyCourses, getCourseStudents, getMyWorkplace };