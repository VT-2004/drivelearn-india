const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const razorpay = require('../utils/razorpayInstance');
const prisma = require('../utils/prismaClient');
const { sendEmail } = require('../utils/emailService');
const { bookingConfirmationEmail, subscriptionReceiptEmail } = require('../utils/emailTemplates');

// ============ COURSE PAYMENT (Learner pays for a booking) ============

// LEARNER: Create a Razorpay order for a booking (wallet balance auto-applied as discount)
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

    const learner = await prisma.user.findUnique({ where: { id: learnerId } });
    const coursePrice = Number(booking.course.price);
    const walletToApply = Math.min(Number(learner.walletBalance), coursePrice);
    const amountDue = coursePrice - walletToApply;

    // Fully covered by wallet - no Razorpay needed at all
    if (amountDue <= 0) {
      return res.json({
        fullyCoveredByWallet: true,
        bookingId: booking.id,
        walletApplied: walletToApply,
      });
    }

    const amountInPaise = Math.round(amountDue * 100);

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
      walletApplied: walletToApply,
      coursePrice,
    });
  } catch (error) {
    console.error('Create booking order error:', error);
    res.status(500).json({ error: 'Something went wrong creating the payment order' });
  }
};

// LEARNER: Confirm a booking that's fully covered by wallet balance (no Razorpay needed)
const confirmBookingWithWallet = async (req, res) => {
  try {
    const learnerId = req.user.id;
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: {
        course: { include: { school: true } },
        learner: true,
        instructor: { include: { user: { select: { name: true } } } },
      },
    });

    if (!booking || booking.learnerId !== learnerId) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'This booking is not awaiting payment' });
    }

    const coursePrice = Number(booking.course.price);
    const learner = booking.learner;
    if (Number(learner.walletBalance) < coursePrice) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: coursePrice,
        walletUsed: coursePrice,
        status: 'success',
        paidAt: new Date(),
      },
    });

    await prisma.user.update({
      where: { id: learnerId },
      data: { walletBalance: { decrement: coursePrice } },
    });

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'confirmed' },
    });

    const emailContent = bookingConfirmationEmail({
      learnerName: booking.learner.name,
      courseName: booking.course.title,
      schoolName: booking.course.school.name,
      bookedDate: new Date(booking.bookedDate).toLocaleDateString('en-IN'),
      instructorName: booking.instructor.user.name,
      amount: `0 (fully paid via wallet)`,
    });
    sendEmail({ to: booking.learner.email, ...emailContent });

    res.json({ message: 'Booking confirmed using wallet balance', booking: updatedBooking });
  } catch (error) {
    console.error('Confirm booking with wallet error:', error);
    res.status(500).json({ error: 'Something went wrong' });
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

    const coursePrice = Number(booking.course.price);
    const walletToApply = Math.min(Number(booking.learner.walletBalance), coursePrice);

    // Create payment record and confirm booking
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: coursePrice,
        walletUsed: walletToApply,
        status: 'success',
        razorpayOrderId: razorpay_order_id,
        paidAt: new Date(),
      },
    });

    if (walletToApply > 0) {
      await prisma.user.update({
        where: { id: booking.learnerId },
        data: { walletBalance: { decrement: walletToApply } },
      });
    }

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

// LEARNER: Download PDF receipt for a paid booking
const downloadReceipt = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const learnerId = req.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: {
        course: { include: { school: true } },
        learner: true,
        instructor: { include: { user: { select: { name: true } } } },
        payment: true,
      },
    });

    if (!booking || booking.learnerId !== learnerId) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (!booking.payment || booking.payment.status !== 'success') {
      return res.status(400).json({ error: 'No successful payment found for this booking' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-booking-${booking.id}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('DriveLearn India', { align: 'left' });
    doc.fontSize(10).fillColor('#666').text('Payment Receipt', { align: 'left' });
    doc.moveDown(1.5);

    doc.fillColor('#000').fontSize(12);
    doc.text(`Receipt No: RCPT-${booking.payment.id}-${booking.id}`);
    doc.text(`Date: ${new Date(booking.payment.paidAt).toLocaleDateString('en-IN')}`);
    doc.moveDown();

    doc.fontSize(13).text('Billed To', { underline: true });
    doc.fontSize(11).text(booking.learner.name);
    doc.text(booking.learner.email);
    doc.text(booking.learner.phone);
    doc.moveDown();

    doc.fontSize(13).text('Course Details', { underline: true });
    doc.fontSize(11).text(`Course: ${booking.course.title}`);
    doc.text(`School: ${booking.course.school.name}`);
    doc.text(`Instructor: ${booking.instructor.user.name}`);
    doc.text(`Lesson Date: ${new Date(booking.bookedDate).toLocaleDateString('en-IN')}`);
    doc.moveDown();

    doc.fontSize(13).text('Payment Summary', { underline: true });
    doc.fontSize(11).text(`Course Price: Rs. ${Number(booking.course.price).toLocaleString('en-IN')}`);
    if (Number(booking.payment.walletUsed) > 0) {
      doc.text(`Wallet Credit Applied: - Rs. ${Number(booking.payment.walletUsed).toLocaleString('en-IN')}`);
    }
    const amountPaidOnline = Number(booking.course.price) - Number(booking.payment.walletUsed || 0);
    doc.fontSize(13).text(`Amount Paid: Rs. ${amountPaidOnline.toLocaleString('en-IN')}`, { underline: false });
    if (booking.payment.razorpayOrderId) {
      doc.fontSize(9).fillColor('#666').text(`Transaction Ref: ${booking.payment.razorpayOrderId}`);
    }
    doc.moveDown(2);

    doc.fontSize(9).fillColor('#999').text('This is a system-generated receipt from DriveLearn India (B2World).', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Download receipt error:', error);
    res.status(500).json({ error: 'Something went wrong generating the receipt' });
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
  confirmBookingWithWallet,
  verifyBookingPayment,
  downloadReceipt,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getMySubscription,
};