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

const welcomeEmail = ({ name, role }) => {
  const roleLabels = {
    learner: 'Learner',
    school_owner: 'Driving School Owner',
    instructor: 'Instructor',
    admin: 'Admin',
  };
  return {
    subject: `Welcome to DriveLearn India, ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #eee;">
        <h2 style="color: #1C1F22;">Welcome to DriveLearn India 🎉</h2>
        <p>Hi ${name},</p>
        <p>
          Your account has been created successfully as a <strong>${roleLabels[role] || role}</strong>.
          We're glad to have you on board!
        </p>
        <p style="color: #6B7680; font-size: 13px;">
          If you didn't create this account, please contact our support team immediately.
        </p>
      </div>
    `,
  };
};

const schoolWarningEmail = ({ ownerName, schoolName, subject, message }) => ({
  subject: subject || `⚠️ Compliance Warning Notice - ${schoolName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-top: 4px solid #E1712E;">
      <h2 style="color: #E1712E; margin-top: 0;">⚠️ Compliance Warning Notice</h2>
      <p>Dear ${ownerName},</p>
      <p>
        The Super Admin team of DriveLearn India National RTO Network has issued an official compliance warning notice for <strong>${schoolName}</strong>:
      </p>
      <div style="background: #FFF8E1; border: 1px solid #FFE082; color: #795548; padding: 14px 18px; border-radius: 8px; font-size: 14.5px; line-height: 1.5; margin: 16px 0;">
        ${message}
      </div>
      <p style="color: #6B7680; font-size: 13px;">
        Please review this notice in your School Owner Dashboard and take necessary corrective action promptly to maintain your verified RTO partner status.
      </p>
    </div>
  `,
});

const schoolSuspendedEmail = ({ ownerName, schoolName, reason }) => ({
  subject: `🛑 Temporary Suspension of Academy License - ${schoolName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-top: 4px solid #D32F2F;">
      <h2 style="color: #D32F2F; margin-top: 0;">🛑 Academy License Suspended</h2>
      <p>Dear ${ownerName},</p>
      <p>
        Your driving academy <strong>${schoolName}</strong> has been <strong>temporarily suspended</strong> on DriveLearn India due to regulatory or compliance concerns.
      </p>
      <div style="background: #FFEBEE; border: 1px solid #FFCDD2; color: #B71C1C; padding: 14px 18px; border-radius: 8px; font-size: 14px; margin: 16px 0;">
        <strong>Suspension Reason:</strong><br/>
        ${reason || 'Violation of DriveLearn India training safety guidelines or unresolved student complaints.'}
      </div>
      <p style="color: #6B7680; font-size: 13px;">
        While suspended, new student enrollments and public directory listings are paused. To appeal or rectify this suspension, please respond directly to this notice or contact admin support.
      </p>
    </div>
  `,
});

const schoolRejectedEmail = ({ ownerName, schoolName, reason }) => ({
  subject: `Application Update - ${schoolName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #eee;">
      <h2 style="color: #B3261E;">Verification Decision Update</h2>
      <p>Hi ${ownerName},</p>
      <p>
        Thank you for submitting your driving school verification documents for <strong>${schoolName}</strong>.
      </p>
      <p>
        After reviewing your submission against RTO compliance standards, your application could not be approved at this time.
      </p>
      ${reason ? `
      <div style="background: #FDEDED; color: #5F2120; padding: 12px 16px; border-radius: 6px; font-size: 14px; margin: 16px 0;">
        <strong>Reason for rejection:</strong><br/>
        ${reason}
      </div>` : ''}
      <p style="color: #6B7680; font-size: 13px;">
        You may log into your School Owner dashboard to re-upload clear RTO license documents or contact admin support for assistance.
      </p>
    </div>
  `,
});

const courseCompletedCertificateEmail = ({ learnerName, courseName, schoolName, instructorName, certificateId }) => ({
  subject: `🎓 Congratulations! Your Driving Certificate is Ready - ${courseName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; border: 1px solid #E2E8F0; border-top: 5px solid #0B192C; border-radius: 8px; background: #FCFBF7;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 36px;">🏆</span>
        <h2 style="color: #0B192C; margin: 8px 0 4px;">Certificate of Driving Competency</h2>
        <div style="font-size: 12px; color: #C59B27; font-weight: bold; letter-spacing: 1px;">DRIVELEARN INDIA NATIONAL ACCREDITATION</div>
      </div>
      <p style="font-size: 15px; color: #1E293B;">Dear <strong>${learnerName}</strong>,</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Heartiest congratulations! You have successfully completed all prescribed practical driving sessions, vehicular control modules, and highway safety assessments for:
      </p>
      <div style="background: #FFFFFF; border: 1.5px solid #E4D3A2; border-radius: 8px; padding: 16px 20px; margin: 18px 0;">
        <div style="font-size: 16px; font-weight: bold; color: #0B192C; margin-bottom: 6px;">${courseName}</div>
        <div style="font-size: 13px; color: #64748B;">📍 <strong>Academy:</strong> ${schoolName}</div>
        <div style="font-size: 13px; color: #64748B; margin-top: 3px;">👨‍🏫 <strong>Instructor:</strong> ${instructorName}</div>
        <div style="font-size: 12px; color: #C59B27; font-weight: bold; margin-top: 6px;">📜 Serial: ${certificateId}</div>
      </div>
      <p style="font-size: 13.5px; color: #475569;">
        Your official RTO-compliant digital certificate has been issued and is available for instant PDF download in your <strong>Learner Dashboard</strong> under the <em>Certificates</em> tab.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="http://localhost:5173/learner" style="background: #0B192C; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
          Download My Certificate (PDF)
        </a>
      </div>
      <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 20px; border-top: 1px solid #E2E8F0; padding-top: 12px;">
        DriveLearn India · Central Motor Vehicles Rules Form 5 Equivalent Verification
      </p>
    </div>
  `,
});

module.exports = {
  bookingConfirmationEmail,
  subscriptionReceiptEmail,
  schoolPendingEmail,
  schoolVerifiedEmail,
  schoolRejectedEmail,
  bookingCancelledEmail,
  welcomeEmail,
  schoolWarningEmail,
  schoolSuspendedEmail,
  schoolReinstatedEmail,
  courseCompletedCertificateEmail,
};