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

module.exports = { bookingConfirmationEmail, subscriptionReceiptEmail };
