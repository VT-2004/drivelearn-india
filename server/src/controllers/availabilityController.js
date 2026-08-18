const prisma = require('../utils/prismaClient');

const getInstructorRecord = async (userId) => prisma.instructor.findUnique({ where: { userId } });

// INSTRUCTOR: Add an availability slot
const addAvailability = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Date, start time, and end time are required' });
    }
    if (startTime >= endTime) {
      return res.status(400).json({ error: 'End time must be after start time' });
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

// INSTRUCTOR: Get my own slots (upcoming, by default)
const getMyAvailability = async (req, res) => {
  try {
    const instructor = await getInstructorRecord(req.user.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor profile not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = await prisma.availabilitySlot.findMany({
      where: { instructorId: instructor.id, date: { gte: today } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
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

// PUBLIC/LEARNER: Get an instructor's upcoming unbooked slots (for booking flow)
const getAvailableSlotsForInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = await prisma.availabilitySlot.findMany({
      where: { instructorId: parseInt(instructorId), isBooked: false, date: { gte: today } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    res.json({ slots });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { addAvailability, getMyAvailability, deleteAvailability, getAvailableSlotsForInstructor };