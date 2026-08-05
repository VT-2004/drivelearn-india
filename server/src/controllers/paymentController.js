const crypto = require('crypto');
const razorpay = require('../utils/razorpayInstance');
const prisma = require('../utils/prismaClient');
const { sendEmail } = require('../utils/emailService');
const { bookingConfirmationEmail, subscriptionReceiptEmail } = require('../utils/emailTemplates');

// ============ COURSE PAYMENT (Learner pays for a booking) ============

// LEARNER: Create a Razorpay order for a booking
const createBookingOrder = async (req, res) => {
  try {
    const learnerId = req.user.id;
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: { course: true },
    });

    if (!booking || booking.learnerId !== learnerId) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'This booking is not awaiting payment' });
    }

    const amountInPaise = Math.round(Number(booking.course.price) * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `booking_${booking.id}`,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingId: booking.id,
    });
  } catch (error) {
    console.error('Create booking order error:', error);
    res.status(500).json({ error: 'Something went wrong creating the payment order' });
  }
};

// LEARNER: Verify payment and confirm the booking
const verifyBookingPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed - signature mismatch' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: {
        course: { include: { school: true } },
        learner: true,
        instructor: { include: { user: { select: { name: true } } } },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Create payment record and confirm booking
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.course.price,
        status: 'success',
        razorpayOrderId: razorpay_order_id,
        paidAt: new Date(),
      },
    });

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'confirmed' },
    });

    // Send confirmation email (non-blocking - won't fail the request if email fails)
    const emailContent = bookingConfirmationEmail({
      learnerName: booking.learner.name,
      courseName: booking.course.title,
      schoolName: booking.course.school.name,
      bookedDate: new Date(booking.bookedDate).toLocaleDateString('en-IN'),
      instructorName: booking.instructor.user.name,
      amount: Number(booking.course.price).toLocaleString('en-IN'),
    });
    sendEmail({ to: booking.learner.email, ...emailContent });

    res.json({ message: 'Payment verified successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Verify booking payment error:', error);
    res.status(500).json({ error: 'Something went wrong verifying payment' });
  }
};

// ============ SCHOOL SUBSCRIPTION ============

const PLAN_PRICES = {
  monthly: 999,
  yearly: 9999,
};

// SCHOOL OWNER: Create a Razorpay order for a subscription plan
const createSubscriptionOrder = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { plan } = req.body; // 'monthly' or 'yearly'

    if (!plan || !PLAN_PRICES[plan]) {
      return res.status(400).json({ error: 'Valid plan (monthly or yearly) is required' });
    }

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school) {
      return res.status(404).json({ error: 'No school registered yet' });
    }

    const amountInPaise = PLAN_PRICES[plan] * 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `subscription_${school.id}_${Date.now()}`,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan,
    });
  } catch (error) {
    console.error('Create subscription order error:', error);
    res.status(500).json({ error: 'Something went wrong creating the subscription order' });
  }
};

// SCHOOL OWNER: Verify subscription payment and activate
const verifySubscriptionPayment = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed - signature mismatch' });
    }

    const school = await prisma.drivingSchool.findUnique({
      where: { ownerId },
      include: { owner: true },
    });
    if (!school) {
      return res.status(404).json({ error: 'No school registered yet' });
    }

    const startDate = new Date();
    const endDate = new Date();
    if (plan === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = await prisma.subscription.create({
      data: {
        schoolId: school.id,
        plan,
        status: 'active',
        startDate,
        endDate,
      },
    });

    const emailContent = subscriptionReceiptEmail({
      ownerName: school.owner.name,
      schoolName: school.name,
      plan,
      amount: PLAN_PRICES[plan].toLocaleString('en-IN'),
      endDate: endDate.toLocaleDateString('en-IN'),
    });
    sendEmail({ to: school.owner.email, ...emailContent });

    res.json({ message: 'Subscription activated successfully', subscription });
  } catch (error) {
    console.error('Verify subscription payment error:', error);
    res.status(500).json({ error: 'Something went wrong verifying subscription payment' });
  }
};

// SCHOOL OWNER: Get current subscription status
const getMySubscription = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school) {
      return res.status(404).json({ error: 'No school registered yet' });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { schoolId: school.id },
      orderBy: { endDate: 'desc' },
    });

    // Auto-check if expired
    let currentStatus = 'none';
    if (subscription) {
      currentStatus = new Date(subscription.endDate) > new Date() ? 'active' : 'expired';
    }

    res.json({ subscription, currentStatus });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = {
  createBookingOrder,
  verifyBookingPayment,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getMySubscription,
};