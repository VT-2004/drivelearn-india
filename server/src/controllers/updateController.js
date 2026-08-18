const prisma = require('../utils/prismaClient');

// INSTRUCTOR or LEARNER: Post an update/comment on a booking
const postUpdate = async (req, res) => {
  try {
    const { bookingId, message } = req.body;
    const userId = req.user.id;
    const role = req.user.role;
    const senderName = req.user.name || (role === 'instructor' ? 'Instructor' : 'Learner');

    if (!bookingId || !message || !message.trim()) {
      return res.status(400).json({ error: 'Booking and message are required' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: {
        instructor: { include: { user: { select: { id: true, name: true } } } },
        learner: { select: { id: true, name: true } },
        course: { select: { id: true, title: true, schoolId: true } },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const isOwnLearnerBooking = role === 'learner' && booking.learnerId === userId;
    const isAssignedInstructor = role === 'instructor' && booking.instructor?.userId === userId;

    if (!isOwnLearnerBooking && !isAssignedInstructor) {
      return res.status(403).json({ error: 'Not authorized to post an update on this booking' });
    }

    const trimmedMsg = message.trim();

    const update = await prisma.lessonUpdate.create({
      data: {
        bookingId: booking.id,
        authorId: userId,
        authorRole: role,
        message: trimmedMsg,
      },
      include: { author: { select: { id: true, name: true, role: true } } },
    });

    // Create Notification for the other party
    try {
      const courseName = booking.course?.title || 'Driving Practical Course';
      const snippet = trimmedMsg.length > 80 ? trimmedMsg.substring(0, 80) + '...' : trimmedMsg;

      if (role === 'learner' && booking.instructor?.userId) {
        // Learner sent -> Notify instructor
        await prisma.notification.create({
          data: {
            userId: booking.instructor.userId,
            schoolId: booking.course?.schoolId || null,
            title: `💬 New Q&A Question from ${senderName}`,
            message: `Student ${senderName} asked regarding #${booking.id} (${courseName}): "${snippet}"`,
            type: 'message',
          },
        });
      } else if (role === 'instructor' && booking.learnerId) {
        // Instructor replied -> Notify learner
        await prisma.notification.create({
          data: {
            userId: booking.learnerId,
            schoolId: booking.course?.schoolId || null,
            title: `💬 Instructor Reply from ${senderName}`,
            message: `Instructor ${senderName} replied regarding #${booking.id} (${courseName}): "${snippet}"`,
            type: 'message',
          },
        });
      }
    } catch (notifErr) {
      console.error('Failed to trigger message notification:', notifErr);
    }

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
    const isAssignedInstructor = role === 'instructor' && booking.instructor?.userId === userId;

    if (!isOwnLearnerBooking && !isAssignedInstructor) {
      return res.status(403).json({ error: 'Not authorized to view updates for this booking' });
    }

    const updates = await prisma.lessonUpdate.findMany({
      where: { bookingId: booking.id },
      include: { author: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ updates });
  } catch (error) {
    console.error('Get updates error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { postUpdate, getUpdates };