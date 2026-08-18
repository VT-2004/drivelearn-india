const prisma = require('../utils/prismaClient');

const getInstructorRecord = async (userId) => prisma.instructor.findUnique({ where: { userId } });

// Convert "HH:mm" to minutes from start of day
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert minutes from start of day to "HH:mm"
const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// INSTRUCTOR: Add a single availability slot with duration validation
const addAvailability = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Date, start time, and end time are required' });
    }

    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);

    if (startMins >= endMins) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const durationMins = endMins - startMins;
    if (durationMins < 15) {
      return res.status(400).json({ error: 'Slot duration must be at least 15 minutes' });
    }
    if (durationMins > 120) {
      return res.status(400).json({
        error: 'Single lesson slot cannot exceed 2 hours (120 minutes). Use "Auto-Generate Slots" for longer working hours.',
      });
    }

    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const existingSameDay = await prisma.availabilitySlot.findMany({
      where: { instructorId: instructor.id, date: { gte: dayStart, lte: dayEnd } },
    });

    const overlaps = existingSameDay.some(
      (s) => startTime < s.endTime && endTime > s.startTime
    );
    if (overlaps) {
      return res.status(409).json({ error: 'This overlaps with an existing slot on that day' });
    }

    const slot = await prisma.availabilitySlot.create({
      data: {
        instructorId: instructor.id,
        date: new Date(date),
        startTime,
        endTime,
      },
    });

    res.status(201).json({ message: 'Availability slot added', slot });
  } catch (error) {
    console.error('Add availability error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// INSTRUCTOR: Auto-generate / batch slice working window into discrete lesson slots
const generateAvailabilitySlots = async (req, res) => {
  try {
    const {
      date,
      windowStartTime,
      windowEndTime,
      slotDuration = 60,
      bufferMinutes = 0,
    } = req.body;

    if (!date || !windowStartTime || !windowEndTime) {
      return res.status(400).json({ error: 'Date, window start time, and window end time are required' });
    }

    const duration = parseInt(slotDuration, 10);
    const buffer = parseInt(bufferMinutes, 10) || 0;

    if (isNaN(duration) || duration < 15 || duration > 120) {
      return res.status(400).json({ error: 'Slot duration must be between 15 and 120 minutes' });
    }
    if (isNaN(buffer) || buffer < 0 || buffer > 60) {
      return res.status(400).json({ error: 'Buffer between slots must be between 0 and 60 minutes' });
    }

    const windowStartMins = timeToMinutes(windowStartTime);
    const windowEndMins = timeToMinutes(windowEndTime);

    if (windowStartMins >= windowEndMins) {
      return res.status(400).json({ error: 'Window end time must be after window start time' });
    }

    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const existingSameDay = await prisma.availabilitySlot.findMany({
      where: { instructorId: instructor.id, date: { gte: dayStart, lte: dayEnd } },
    });

    const candidateSlots = [];
    let currentStart = windowStartMins;

    while (currentStart + duration <= windowEndMins) {
      const slotStart = minutesToTime(currentStart);
      const slotEnd = minutesToTime(currentStart + duration);

      const overlaps = existingSameDay.some(
        (s) => slotStart < s.endTime && slotEnd > s.startTime
      );

      if (!overlaps) {
        candidateSlots.push({
          instructorId: instructor.id,
          date: new Date(date),
          startTime: slotStart,
          endTime: slotEnd,
        });
      }

      currentStart += duration + buffer;
    }

    if (candidateSlots.length === 0) {
      return res.status(400).json({
        error: 'No valid slots could be generated (either window is too short or all slots conflict with existing ones).',
      });
    }

    const created = await prisma.$transaction(
      candidateSlots.map((s) => prisma.availabilitySlot.create({ data: s }))
    );

    res.status(201).json({
      message: `Successfully generated ${created.length} lesson slot${created.length !== 1 ? 's' : ''}`,
      slots: created,
      count: created.length,
    });
  } catch (error) {
    console.error('Generate availability error:', error);
    res.status(500).json({ error: 'Something went wrong generating slots' });
  }
};

// Helper to check if a slot is in the past or expired today
const isSlotInPastOrExpired = (slotDate, startTime, endTime, now = new Date()) => {
  const sDate = new Date(slotDate);
  sDate.setHours(0, 0, 0, 0);

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  if (sDate < todayStart) {
    return true; // Past day: vanished
  }

  if (sDate.getTime() === todayStart.getTime()) {
    const nowTimeStr = now.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    // If slot's end time (or start time) has already passed today
    return (endTime || startTime) <= nowTimeStr;
  }

  return false;
};

// INSTRUCTOR: Get my own slots (upcoming active, excluding expired unbooked ones)
const getMyAvailability = async (req, res) => {
  try {
    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rawSlots = await prisma.availabilitySlot.findMany({
      where: { instructorId: instructor.id, date: { gte: today } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    const now = new Date();
    // Exclude unbooked slots that expired earlier today or in the past
    const slots = rawSlots.filter((s) => {
      if (s.isBooked) return true; // Keep booked lessons
      return !isSlotInPastOrExpired(s.date, s.startTime, s.endTime, now);
    });

    res.json({ slots });
  } catch (error) {
    console.error('Get my availability error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// INSTRUCTOR: Delete a slot (only if not already booked)
const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const slot = await prisma.availabilitySlot.findUnique({ where: { id: parseInt(id) } });
    if (!slot || slot.instructorId !== instructor.id) {
      return res.status(403).json({ error: 'Not authorized to delete this slot' });
    }
    if (slot.isBooked) {
      return res.status(400).json({ error: 'Cannot delete a slot that has already been booked' });
    }

    await prisma.availabilitySlot.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Slot deleted' });
  } catch (error) {
    console.error('Delete availability error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// PUBLIC/LEARNER: Get an instructor's upcoming unbooked slots (strictly non-expired)
const getAvailableSlotsForInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rawSlots = await prisma.availabilitySlot.findMany({
      where: { instructorId: parseInt(instructorId), isBooked: false, date: { gte: today } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    const now = new Date();
    const slots = rawSlots.filter((s) => !isSlotInPastOrExpired(s.date, s.startTime, s.endTime, now));

    res.json({ slots });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// SCHOOL OWNER: Get schedule / timetable across all school instructors (cleanly filtered)
const getSchoolSchedule = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { instructorId, date } = req.query;

    const school = await prisma.drivingSchool.findUnique({
      where: { ownerId },
      include: {
        instructors: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
      },
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const instructorIds = school.instructors.map((i) => i.id);
    if (instructorIds.length === 0) {
      return res.json({
        school: { id: school.id, name: school.name },
        instructors: [],
        slots: [],
        stats: { totalSlots: 0, bookedSlots: 0, openSlots: 0 },
      });
    }

    const whereClause = {
      instructorId: instructorId ? parseInt(instructorId) : { in: instructorIds },
    };

    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      whereClause.date = { gte: dayStart, lte: dayEnd };
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      whereClause.date = { gte: today };
    }

    const rawSlots = await prisma.availabilitySlot.findMany({
      where: whereClause,
      include: {
        instructor: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
        booking: {
          include: {
            learner: { select: { id: true, name: true, email: true, phone: true } },
            course: { select: { id: true, title: true, durationDays: true } },
          },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    const now = new Date();
    // Filter out unbooked slots that expired in previous days or earlier today
    const slots = rawSlots.filter((s) => {
      if (s.isBooked) return true; // Keep active bookings
      return !isSlotInPastOrExpired(s.date, s.startTime, s.endTime, now);
    });

    const bookedSlots = slots.filter((s) => s.isBooked).length;
    const openSlots = slots.filter((s) => !s.isBooked).length;

    res.json({
      school: { id: school.id, name: school.name },
      instructors: school.instructors.map((i) => ({ id: i.id, name: i.user.name })),
      slots,
      stats: {
        totalSlots: slots.length,
        bookedSlots,
        openSlots,
      },
    });
  } catch (error) {
    console.error('Get school schedule error:', error);
    res.status(500).json({ error: 'Something went wrong fetching schedule' });
  }
};

module.exports = {
  addAvailability,
  generateAvailabilitySlots,
  getMyAvailability,
  deleteAvailability,
  getAvailableSlotsForInstructor,
  getSchoolSchedule,
};