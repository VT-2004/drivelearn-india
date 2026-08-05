const nodemailer = require('nodemailer');

let transporterPromise = null;

// Uses real SMTP credentials if provided in .env, otherwise falls back to
// an auto-generated Ethereal test account (no signup needed, emails viewable
// via a preview link logged to the console - perfect for development).
const getTransporter = async () => {
  if (transporterPromise) return transporterPromise;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = parseInt(process.env.SMTP_PORT) || 587;
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465, // true for 465 (SSL), false for 587 (TLS)
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    );
  } else {
    transporterPromise = nodemailer.createTestAccount().then((testAccount) =>
      nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })
    );
  }

  return transporterPromise;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = await getTransporter();

    // Use the real configured email as sender when using real SMTP,
    // otherwise use a placeholder (fine for Ethereal test mode)
    const fromAddress = process.env.SMTP_USER
      ? `"DriveLearn India" <${process.env.SMTP_USER}>`
      : '"DriveLearn India" <no-reply@drivelearn.in>';

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('📧 Email sent (test mode). Preview URL:', previewUrl);
    } else {
      console.log('📧 Email sent to', to);
    }
  } catch (error) {
    console.error('Email send error (non-blocking):', error.message);
    // Intentionally not re-thrown - a failed email should never break the main request
  }
};

module.exports = { sendEmail };