const prisma = require('../utils/prismaClient');
const { sendEmail } = require('../utils/emailService');
const { courseCompletedCertificateEmail } = require('../utils/emailTemplates');

const STANDARD_14_MILESTONES = [
  {
    milestoneIndex: 1,
    dayRange: 'Days 1 - 2',
    title: 'Vehicle Cockpit, Dashboard & ABC Pedals Inspection',
    description: 'Vehicle pre-trip walkaround, seat & mirror ergonomics, ABC (Accelerator, Brake, Clutch) foot positioning, ignition sequence & dashboard telltale warning lights.',
  },
  {
    milestoneIndex: 2,
    dayRange: 'Days 3 - 4',
    title: 'Smooth Starting, Stopping & Dead Stop Control',
    description: 'Engine firing sequence, progressive acceleration, smooth progressive braking to a dead stop without cabin lurch, anti-stall technique.',
  },
  {
    milestoneIndex: 3,
    dayRange: 'Days 5 - 6',
    title: 'Clutch Control & Bite Point Balancing',
    description: 'Half-clutch friction zone discovery, low-speed zero-throttle crawling, clutch balance on slight gradients, smooth takeoff.',
  },
  {
    milestoneIndex: 4,
    dayRange: 'Days 7 - 8',
    title: 'Gear Shifting & Synchronized Deceleration',
    description: '1st to 4th gear sequential upshifting, rev-matching downshifting, engine braking, speed-to-gear selection for urban driving.',
  },
  {
    milestoneIndex: 5,
    dayRange: 'Days 9 - 10',
    title: 'Steering Precision, Lane Centering & 3-Point Turns',
    description: 'Hand-over-hand and push-pull steering techniques, lane centering, 90-degree cornering, 3-point road reversal in narrow streets.',
  },
  {
    milestoneIndex: 6,
    dayRange: 'Days 11 - 12',
    title: 'RTO 8-Track Forward & Spatial Maneuver',
    description: 'Continuous figure-8 navigation without tire boundary crossing, spatial judgment, mirror checks, steering speed synchronization.',
  },
  {
    milestoneIndex: 7,
    dayRange: 'Days 13 - 14',
    title: 'RTO 8-Track Reverse Maneuvering',
    description: 'Reverse figure-8 track navigation relying strictly on ORVM side mirrors, subtle steering adjustments, throttle-clutch moderation.',
  },
  {
    milestoneIndex: 8,
    dayRange: 'Days 15 - 16',
    title: 'RTO H-Track Reversing & Precision 90° Bay Parking',
    description: 'Entry and reverse exit in official "H" formation track, 90-degree perpendicular garage bay parking within boundary cones.',
  },
  {
    milestoneIndex: 9,
    dayRange: 'Days 17 - 18',
    title: 'Slope Start & Gradient Hill Ascent (Zero Rollback)',
    description: 'Handbrake-assisted slope takeoff, friction point holding on steep inclines without rollback, stop-and-go hill climbing.',
  },
  {
    milestoneIndex: 10,
    dayRange: 'Days 19 - 20',
    title: 'City Traffic Navigation, Signals & Roundabouts',
    description: 'Multi-lane urban traffic flow, traffic signal compliance, right-of-way entry at roundabouts, mirror-indicator-maneuver protocol.',
  },
  {
    milestoneIndex: 11,
    dayRange: 'Days 21 - 22',
    title: 'Pedestrian Zones, Hazard Perception & Defensive Driving',
    description: 'Hazard anticipation, two-wheeler and pedestrian buffer zones, safe following distance, sudden emergency braking control.',
  },
  {
    milestoneIndex: 12,
    dayRange: 'Days 23 - 24',
    title: 'Highway Cruising, Speed Modulation & Safe Overtaking',
    description: 'Expressway cruising (60-80 km/h), overtaking protocol with headlamp dipping, lane discipline, merging and exiting expressways.',
  },
  {
    milestoneIndex: 13,
    dayRange: 'Days 25 - 26',
    title: 'Reverse Parallel Parking & Tight Spot Curb Alignment',
    description: '45-degree reverse parallel curb parking between two vehicles, curb proximity judgment within 15 cm, zero curb-rash execution.',
  },
  {
    milestoneIndex: 14,
    dayRange: 'Days 27 - 28',
    title: 'Final 100-Point Mock RTO Test & Form 5 Verification',
    description: 'Comprehensive 100-point mock driving test under RTO inspector criteria, evaluation of road safety mastery, Form 5 certificate unlock.',
  },
];

// Helper: Ensure 14 milestones exist for a booking, create them if missing
const ensureMilestonesForBooking = async (bookingId) => {
  const existing = await prisma.bookingMilestone.findMany({
    where: { bookingId: parseInt(bookingId) },
    orderBy: { milestoneIndex: 'asc' },
  });

  if (existing.length === 14) {
    return existing;
  }

  // Create missing milestones
  const existingIndexes = new Set(existing.map((m) => m.milestoneIndex));
  const toCreate = STANDARD_14_MILESTONES.filter((m) => !existingIndexes.has(m.milestoneIndex));

  for (const m of toCreate) {
    await prisma.bookingMilestone.create({
      data: {
        bookingId: parseInt(bookingId),
        milestoneIndex: m.milestoneIndex,
        dayRange: m.dayRange,
        title: m.title,
        description: m.description,
        status: 'pending',
      },
    });
  }

  return prisma.bookingMilestone.findMany({
    where: { bookingId: parseInt(bookingId) },
    orderBy: { milestoneIndex: 'asc' },
  });
};

// GET: Fetch all 14 milestones for a booking (Learner or Instructor)
const getBookingMilestones = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: {
        instructor: true,
        learner: { select: { id: true, name: true } },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const isLearnerOwner = role === 'learner' && booking.learnerId === userId;
    const isInstructorAssigned = role === 'instructor' && booking.instructor?.userId === userId;

    if (!isLearnerOwner && !isInstructorAssigned && role !== 'admin' && role !== 'school_owner') {
      return res.status(403).json({ error: 'Not authorized to view milestones for this booking' });
    }

    const milestones = await ensureMilestonesForBooking(booking.id);
    const completedCount = milestones.filter((m) => m.status === 'completed').length;
    const progressPercent = Math.round((completedCount / 14) * 100);

    res.json({
      bookingId: booking.id,
      milestones,
      completedCount,
      totalMilestones: 14,
      totalCourseDays: 28,
      progressPercent,
    });
  } catch (error) {
    console.error('Get booking milestones error:', error);
    res.status(500).json({ error: 'Failed to retrieve course milestones' });
  }
};

// PATCH: Instructor updates milestone status / remarks
const updateMilestone = async (req, res) => {
  try {
    const { bookingId, milestoneIndex } = req.params;
    const { status, instructorNotes } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, in_progress, or completed.' });
    }

    const instructor = await prisma.instructor.findUnique({ where: { userId } });
    if (!instructor && role !== 'admin') {
      return res.status(403).json({ error: 'Only certified instructors can update student milestones' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: {
        instructor: { include: { user: { select: { name: true } } } },
        learner: { select: { id: true, name: true, email: true } },
        course: { include: { school: true } },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (role !== 'admin' && booking.instructorId !== instructor.id) {
      return res.status(403).json({ error: 'Not authorized to update milestones for this student' });
    }

    // Ensure milestone records exist
    await ensureMilestonesForBooking(booking.id);

    const updatedMilestone = await prisma.bookingMilestone.update({
      where: {
        bookingId_milestoneIndex: {
          bookingId: booking.id,
          milestoneIndex: parseInt(milestoneIndex),
        },
      },
      data: {
        status,
        instructorNotes: instructorNotes !== undefined ? instructorNotes : undefined,
        completedAt: status === 'completed' ? new Date() : null,
        instructorId: instructor?.id || null,
      },
    });

    // Notify learner of milestone progression
    try {
      const instructorName = req.user.name || 'Your Instructor';
      if (status === 'completed') {
        await prisma.notification.create({
          data: {
            userId: booking.learnerId,
            schoolId: booking.course?.schoolId || null,
            title: `✓ Milestone ${updatedMilestone.milestoneIndex} Cleared! (${updatedMilestone.dayRange})`,
            message: `Instructor ${instructorName} marked "${updatedMilestone.title}" as Cleared! ${instructorNotes ? `Notes: "${instructorNotes}"` : ''}`,
            type: 'success',
          },
        });
      } else if (status === 'in_progress') {
        await prisma.notification.create({
          data: {
            userId: booking.learnerId,
            schoolId: booking.course?.schoolId || null,
            title: `⏳ Milestone ${updatedMilestone.milestoneIndex} Now In Progress (${updatedMilestone.dayRange})`,
            message: `You are now training on "${updatedMilestone.title}". Focus on smooth control and mirror checks!`,
            type: 'info',
          },
        });
      }
    } catch (notifErr) {
      console.error('Failed to notify learner on milestone update:', notifErr);
    }

    // Check if ALL 14 milestones are now completed -> auto complete course & send certificate
    const allMilestones = await prisma.bookingMilestone.findMany({
      where: { bookingId: booking.id },
    });
    const completedCount = allMilestones.filter((m) => m.status === 'completed').length;

    if (completedCount === 14 && booking.status !== 'completed') {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'completed' },
      });

      const certificateId = `DLI-RTO-${new Date().getFullYear()}-${String(booking.id).padStart(6, '0')}`;

      // Create completion notification
      await prisma.notification.create({
        data: {
          userId: booking.learnerId,
          schoolId: booking.course?.schoolId || null,
          title: '🎓 Full 28-Day Course Completed! Driving Certificate Ready',
          message: `Congratulations! You have cleared all 14 practical driving modules (${booking.course?.title}). Your official Form 5 Certificate (${certificateId}) is now ready!`,
          type: 'certificate',
        },
      });

      // Send congratulatory certificate email
      try {
        if (booking.learner?.email) {
          const mailContent = courseCompletedCertificateEmail({
            learnerName: booking.learner.name,
            courseName: booking.course.title,
            schoolName: booking.course.school.name,
            instructorName: booking.instructor?.user?.name || instructorName,
            certificateId,
          });
          sendEmail({ to: booking.learner.email, ...mailContent });
        }
      } catch (mailErr) {
        console.error('Failed to send certificate email:', mailErr);
      }
    }

    res.json({
      message: 'Milestone updated successfully',
      milestone: updatedMilestone,
      completedCount,
      totalMilestones: 14,
      courseStatus: completedCount === 14 ? 'completed' : booking.status,
    });
  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
};

module.exports = {
  STANDARD_14_MILESTONES,
  ensureMilestonesForBooking,
  getBookingMilestones,
  updateMilestone,
};
