const bookingConfirmationEmail = ({ learnerName, courseName, schoolName, bookedDate, instructorName, amount }) => ({
  subject: `Booking Confirmed - ${courseName} at ${schoolName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #eee;">
      <h2 style="color: #1C1F22;">Booking Confirmed ✓</h2>
      <p>Hi ${learnerName},</p>
      <p>Your payment was successful and your booking is now confirmed. Here are the details:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 0; color: #6B7680;">Course</td><td style="padding: 8px 0; font-weight: bold;">${courseName}</td></tr>
        <tr><td style="padding: 8px 0; color: #6B7680;">School</td><td style="padding: 8px 0; font-weight: bold;">${schoolName}</td></tr>
        <tr><td style="padding: 8px 0; color: #6B7680;">Date</td><td style="padding: 8px 0; font-weight: bold;">${bookedDate}</td></tr>
        <tr><td style="padding: 8px 0; color: #6B7680;">Instructor</td><td style="padding: 8px 0; font-weight: bold;">${instructorName}</td></tr>
        <tr><td style="padding: 8px 0; color: #6B7680;">Amount Paid</td><td style="padding: 8px 0; font-weight: bold;">₹${amount}</td></tr>
      </table>
      <p style="color: #6B7680; font-size: 13px;">Thanks for choosing DriveLearn India. Good luck with your lessons!</p>
    </div>
  `,
});

const subscriptionReceiptEmail = ({ ownerName, schoolName, plan, amount, endDate }) => ({
  subject: `Subscription Activated - ${schoolName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #eee;">
      <h2 style="color: #1C1F22;">Subscription Activated ✓</h2>
      <p>Hi ${ownerName},</p>
      <p>Your DriveLearn India subscription for <strong>${schoolName}</strong> is now active.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 0; color: #6B7680;">Plan</td><td style="padding: 8px 0; font-weight: bold;">${plan === 'monthly' ? 'Monthly' : 'Yearly'}</td></tr>
        <tr><td style="padding: 8px 0; color: #6B7680;">Amount Paid</td><td style="padding: 8px 0; font-weight: bold;">₹${amount}</td></tr>
        <tr><td style="padding: 8px 0; color: #6B7680;">Valid Until</td><td style="padding: 8px 0; font-weight: bold;">${endDate}</td></tr>
      </table>
      <p style="color: #6B7680; font-size: 13px;">Your school stays live and bookable on the platform until this date.</p>
    </div>
  `,
});

const schoolPendingEmail = ({ ownerName, schoolName }) => ({
  subject: `Registration Received - ${schoolName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #eee;">
      <h2 style="color: #1C1F22;">Registration Received</h2>
      <p>Hi ${ownerName},</p>
      <p>
        Thanks for registering <strong>${schoolName}</strong> on DriveLearn India.
        Your submission is currently <strong>pending verification</strong> by our team.
      </p>
      <p style="background: #FFF3CD; color: #856404; padding: 12px 16px; border-radius: 6px; font-size: 14px;">
        We typically review new registrations within 1-3 business days. You'll receive
        another email as soon as a decision is made.
      </p>
      <p style="color: #6B7680; font-size: 13px;">
        In the meantime, feel free to log in and set up your branches, instructors, and courses
        so you're ready to go live the moment you're verified.
      </p>
    </div>
  `,
});

const schoolVerifiedEmail = ({ ownerName, schoolName }) => ({
  subject: `You're Verified! Welcome to DriveLearn India, ${schoolName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #eee;">
      <h2 style="color: #2E7D32;">Verification Successful ✓</h2>
      <p>Hi ${ownerName},</p>
      <p>
        Great news — <strong>${schoolName}</strong> has been verified and is now
        <strong>live</strong> on DriveLearn India!
      </p>
      <p style="background: #E8F5E9; color: #2E7D32; padding: 12px 16px; border-radius: 6px; font-size: 14px;">
        Welcome aboard! Learners across the platform can now find and book courses at your school.
      </p>
      <p style="color: #6B7680; font-size: 13px;">
        Make sure your courses, instructors, and pricing are up to date so learners get the best
        first impression. We're excited to have you on the platform!
      </p>
    </div>
  `,
});

const bookingCancelledEmail = ({ learnerName, courseName, schoolName, bookedDate, cancelledBy }) => ({
  subject: `Booking Cancelled - ${courseName} at ${schoolName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #eee;">
      <h2 style="color: #B3261E;">Booking Cancelled</h2>
      <p>Hi ${learnerName},</p>
      <p>
        This is a confirmation that the following booking has been cancelled
        ${cancelledBy === 'school_owner' ? 'by the driving school' : 'by you'}:
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 0; color: #6B7680;">Course</td><td style="padding: 8px 0; font-weight: bold;">${courseName}</td></tr>
        <tr><td style="padding: 8px 0; color: #6B7680;">School</td><td style="padding: 8px 0; font-weight: bold;">${schoolName}</td></tr>
        <tr><td style="padding: 8px 0; color: #6B7680;">Original Date</td><td style="padding: 8px 0; font-weight: bold;">${bookedDate}</td></tr>
      </table>
      <p style="color: #6B7680; font-size: 13px;">
        If you didn't expect this cancellation, please contact the driving school or our support team.
        You're welcome to book another course anytime.
      </p>
    </div>
  `,
});

module.exports = { bookingConfirmationEmail, subscriptionReceiptEmail, schoolPendingEmail, schoolVerifiedEmail, bookingCancelledEmail };