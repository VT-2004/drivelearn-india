const prisma = require('../utils/prismaClient');

// INSTRUCTOR or LEARNER: Post an update/comment on a booking
const postUpdate = async (req, res) => {
  try {
    const { bookingId, message } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (!bookingId || !message || !message.trim()) {
      return res.status(400).json({ error: 'Booking and message are required' });
    }

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
      return res.status(403).json({ error: 'Not authorized to post an update on this booking' });
    }

    const update = await prisma.lessonUpdate.create({
      data: {
        bookingId: booking.id,
        authorId: userId,
        authorRole: role,
        message: message.trim(),
      },
      include: { author: { select: { name: true } } },
    });

    res.status(201).json({ message: 'Update posted', update });
  } catch (error) {
    console.error('Post update error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// INSTRUCTOR or LEARNER: Get all updates for a booking
const getUpdates = async (req, res) => {
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
      return res.status(403).json({ error: 'Not authorized to view updates for this booking' });
    }

    const updates = await prisma.lessonUpdate.findMany({
      where: { bookingId: booking.id },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ updates });
  } catch (error) {
    console.error('Get updates error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { postUpdate, getUpdates };