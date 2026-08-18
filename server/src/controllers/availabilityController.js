const prisma = require('../utils/prismaClient');

const getInstructorRecord = async (userId) => prisma.instructor.findUnique({ where: { userId } });

// Convert "HH:mm" to minutes from start of day
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert minutes from start of day to "HH:mm"
const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Helper: Check if slot is expired (past date or past time today)
const isSlotInPastOrExpired = (slotDate, startTime, endTime, now = new Date()) => {
  const sDate = new Date(slotDate);
  sDate.setHours(0, 0, 0, 0);

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  if (sDate < todayStart) {
    return true; // Expired past day
  }

  if (sDate.getTime() === todayStart.getTime()) {
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();
    const nowTimeStr = `${String(nowHours).padStart(2, '0')}:${String(nowMinutes).padStart(2, '0')}`;
    // If slot's end time (or start time) has already passed today
    return (endTime || startTime) <= nowTimeStr;
  }

  return false;
};

// Standard default daily time windows for auto-generation (1 hr each + 15 min turnover buffer)
const DEFAULT_DAILY_SLOTS = [
  { startTime: '07:00', endTime: '08:00' },
  { startTime: '08:15', endTime: '09:15' },
  { startTime: '09:30', endTime: '10:30' },
  { startTime: '10:45', endTime: '11:45' },
  { startTime: '12:00', endTime: '13:00' },
  { startTime: '14:00', endTime: '15:00' },
  { startTime: '15:15', endTime: '16:15' },
  { startTime: '16:30', endTime: '17:30' },
  { startTime: '17:45', endTime: '18:45' },
];

/**
 * Ensures upcoming rolling days (today + next days) have slots generated
 * - Skips days where instructor is on leave
 * - Skips days where slots are already generated
 * - Prunes past unbooked vanished slots
 */
const ensureRollingAvailability = async (instructorId, daysAhead = 7) => {
  try {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // 1. Prune expired unbooked slots from previous days
    await prisma.availabilitySlot.deleteMany({
      where: {
        instructorId,
        isBooked: false,
        date: { lt: today },
      },
    }).catch(() => null);

    // 2. Fetch all upcoming approved leaves for this instructor
    const endWindow = new Date(today);
    endWindow.setDate(endWindow.getDate() + daysAhead + 1);

    const leaves = await prisma.instructorLeave.findMany({
      where: {
        instructorId,
        date: { gte: today, lte: endWindow },
      },
    });

    const leaveDateSet = new Set(
      leaves.map((l) => new Date(l.date).toISOString().split('T')[0])
    );

    // 3. Loop through upcoming days and generate slots if none exist and not on leave
    for (let i = 0; i <= daysAhead; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + i);
      const dateKey = targetDate.toISOString().split('T')[0];

      // If instructor is on leave on this date, skip auto-generating
      if (leaveDateSet.has(dateKey)) {
        continue;
      }

      const dayStart = new Date(targetDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetDate);
      dayEnd.setHours(23, 59, 59, 999);

      const existingCount = await prisma.availabilitySlot.count({
        where: {
          instructorId,
          date: { gte: dayStart, lte: dayEnd },
        },
      });

      // If no slots exist for this active working day, auto-generate standard daily slots
      if (existingCount === 0) {
        const slotsToCreate = DEFAULT_DAILY_SLOTS.map((s) => ({
          instructorId,
          date: new Date(targetDate),
          startTime: s.startTime,
          endTime: s.endTime,
          isBooked: false,
        }));

        await prisma.availabilitySlot.createMany({
          data: slotsToCreate,
          skipDuplicates: true,
        }).catch(() => null);
      }
    }
  } catch (err) {
    console.error('ensureRollingAvailability error:', err);
  }
};

// INSTRUCTOR: Add a single availability slot
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
        error: 'Single lesson slot cannot exceed 2 hours. Use "Auto-Generate Slots" for longer shifts.',
      });
    }

    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const targetDate = new Date(date);
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Check if on leave on that date
    const isOnLeave = await prisma.instructorLeave.findFirst({
      where: { instructorId: instructor.id, date: { gte: dayStart, lte: dayEnd } },
    });
    if (isOnLeave) {
      return res.status(400).json({ error: 'Cannot add slots on a day marked as Leave / Day Off.' });
    }

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

    // Check if on leave
    const isOnLeave = await prisma.instructorLeave.findFirst({
      where: { instructorId: instructor.id, date: { gte: dayStart, lte: dayEnd } },
    });
    if (isOnLeave) {
      return res.status(400).json({ error: 'Cannot generate slots on a date marked as Leave / Day Off.' });
    }

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
        error: 'No valid new slots could be generated (slots conflict with existing ones or window is too short).',
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

// INSTRUCTOR: Mark date as Leave / Day Off
const markInstructorLeave = async (req, res) => {
  try {
    const { date, reason } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'Date is required for leave' });
    }

    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const leaveDateKey = typeof date === 'string' ? date.split('T')[0] : new Date(date).toISOString().split('T')[0];
    const [y, m, d] = leaveDateKey.split('-').map(Number);
    const leaveDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    const rangeStart = new Date(leaveDate.getTime() - 24 * 3600 * 1000);
    const rangeEnd = new Date(leaveDate.getTime() + 24 * 3600 * 1000);

    // 1. Create or update leave record
    const leave = await prisma.instructorLeave.upsert({
      where: {
        instructorId_date: {
          instructorId: instructor.id,
          date: leaveDate,
        },
      },
      update: { reason: reason || 'Day Off' },
      create: {
        instructorId: instructor.id,
        date: leaveDate,
        reason: reason || 'Day Off',
      },
    });

    // 2. Query all slots around this date and delete all unbooked slots matching this date string
    const existingSlots = await prisma.availabilitySlot.findMany({
      where: {
        instructorId: instructor.id,
        date: { gte: rangeStart, lte: rangeEnd },
      },
    });

    const unbookedIdsToDelete = existingSlots
      .filter((s) => !s.isBooked && new Date(s.date).toISOString().split('T')[0] === leaveDateKey)
      .map((s) => s.id);

    if (unbookedIdsToDelete.length > 0) {
      await prisma.availabilitySlot.deleteMany({
        where: { id: { in: unbookedIdsToDelete } },
      });
    }

    // Check if there are any existing booked sessions on that date to warn the instructor
    const bookedSessions = existingSlots.filter(
      (s) => s.isBooked && new Date(s.date).toISOString().split('T')[0] === leaveDateKey
    );

    res.status(201).json({
      message: 'Day marked as Leave. All unbooked slots removed.',
      leave,
      deletedSlotsCount: unbookedIdsToDelete.length,
      bookedSessionsCount: bookedSessions.length,
      bookedSessions,
    });
  } catch (error) {
    console.error('Mark leave error:', error);
    res.status(500).json({ error: 'Failed to mark leave' });
  }
};

// INSTRUCTOR: Get all upcoming leave dates
const getMyLeaves = async (req, res) => {
  try {
    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leaves = await prisma.instructorLeave.findMany({
      where: {
        instructorId: instructor.id,
        date: { gte: new Date(today.getTime() - 24 * 3600 * 1000) },
      },
      orderBy: { date: 'asc' },
    });

    res.json({ leaves });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ error: 'Failed to get leaves' });
  }
};

// INSTRUCTOR: Cancel a marked leave
const cancelInstructorLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    await prisma.instructorLeave.delete({
      where: { id: parseInt(id) },
    }).catch(() => null);

    // Re-run rolling slot generation to restore slots on this newly unblocked date
    await ensureRollingAvailability(instructor.id, 7);

    res.json({ message: 'Leave cancelled. Standard lesson slots automatically re-generated.' });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({ error: 'Failed to cancel leave' });
  }
};

// INSTRUCTOR: Get my own slots (cleanly filtered and auto-ensured)
const getMyAvailability = async (req, res) => {
  try {
    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    // Ensure next 7 rolling days have availability slots
    await ensureRollingAvailability(instructor.id, 7);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [rawSlots, leaves] = await Promise.all([
      prisma.availabilitySlot.findMany({
        where: { instructorId: instructor.id, date: { gte: new Date(today.getTime() - 24 * 3600 * 1000) } },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      }),
      prisma.instructorLeave.findMany({
        where: { instructorId: instructor.id, date: { gte: new Date(today.getTime() - 24 * 3600 * 1000) } },
        orderBy: { date: 'asc' },
      }),
    ]);

    const leaveDateSet = new Set(
      leaves.map((l) => new Date(l.date).toISOString().split('T')[0])
    );

    const now = new Date();
    // Exclude unbooked slots that expired earlier today or belong to leave dates
    const slots = rawSlots.filter((s) => {
      const slotDateKey = new Date(s.date).toISOString().split('T')[0];
      if (leaveDateSet.has(slotDateKey) && !s.isBooked) return false;
      if (s.isBooked) return true;
      return !isSlotInPastOrExpired(s.date, s.startTime, s.endTime, now);
    });

    res.json({ slots, leaves });
  } catch (error) {
    console.error('Get my availability error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// INSTRUCTOR: Delete a slot
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
      return res.status(400).json({ error: 'Cannot delete a slot that has already been booked by a student' });
    }

    await prisma.availabilitySlot.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Slot deleted' });
  } catch (error) {
    console.error('Delete availability error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// PUBLIC/LEARNER: Get an instructor's upcoming unbooked slots (strictly non-expired and skipping leaves)
const getAvailableSlotsForInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const iId = parseInt(instructorId, 10);

    // Auto-ensure rolling slots for instructor so learners always have booking choices
    await ensureRollingAvailability(iId, 7);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rawSlots = await prisma.availabilitySlot.findMany({
      where: { instructorId: iId, isBooked: false, date: { gte: today } },
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

// SCHOOL OWNER: Get schedule across all school instructors
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
        leaves: [],
        stats: { totalSlots: 0, bookedSlots: 0, openSlots: 0 },
      });
    }

    // Auto-ensure rolling slots for all instructors
    await Promise.all(instructorIds.map((id) => ensureRollingAvailability(id, 7)));

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

    const [rawSlots, leaves] = await Promise.all([
      prisma.availabilitySlot.findMany({
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
      }),
      prisma.instructorLeave.findMany({
        where: { instructorId: { in: instructorIds } },
        include: { instructor: { include: { user: { select: { name: true } } } } },
        orderBy: { date: 'asc' },
      }),
    ]);

    const now = new Date();
    const slots = rawSlots.filter((s) => {
      if (s.isBooked) return true;
      return !isSlotInPastOrExpired(s.date, s.startTime, s.endTime, now);
    });

    const bookedSlots = slots.filter((s) => s.isBooked).length;
    const openSlots = slots.filter((s) => !s.isBooked).length;

    res.json({
      school: { id: school.id, name: school.name },
      instructors: school.instructors.map((i) => ({ id: i.id, name: i.user.name })),
      slots,
      leaves,
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
  markInstructorLeave,
  getMyLeaves,
  cancelInstructorLeave,
};