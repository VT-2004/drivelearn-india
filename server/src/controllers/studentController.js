const prisma = require('../utils/prismaClient');

// SCHOOL OWNER: Get all students (learners) who have booked courses at this school
const getMyStudents = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school) {
      return res.status(404).json({ error: 'No school registered yet' });
    }

    const bookings = await prisma.booking.findMany({
      where: { course: { schoolId: school.id } },
      include: {
        learner: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
        course: { select: { title: true } },
        instructor: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group bookings by learner to build a per-student summary
    const studentsMap = {};
    bookings.forEach((b) => {
      const lid = b.learner.id;
      if (!studentsMap[lid]) {
        studentsMap[lid] = {
          ...b.learner,
          courses: [],
          totalBookings: 0,
          activeBookings: 0,
        };
      }
      studentsMap[lid].courses.push({
        title: b.course.title,
        status: b.status,
        bookedDate: b.bookedDate,
        instructor: b.instructor.user.name,
      });
      studentsMap[lid].totalBookings += 1;
      if (['confirmed', 'completed'].includes(b.status)) {
        studentsMap[lid].activeBookings += 1;
      }
    });

    res.json({ students: Object.values(studentsMap) });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { getMyStudents };