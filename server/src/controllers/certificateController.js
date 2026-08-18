const PDFDocument = require('pdfkit');
const prisma = require('../utils/prismaClient');

const downloadCertificate = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const learnerId = req.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: {
        course: { include: { school: true } },
        learner: true,
        instructor: { include: { user: { select: { name: true, phone: true } } } },
        attendance: true,
      },
    });

    if (!booking || booking.learnerId !== learnerId) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Certificate is only available once the course is marked completed' });
    }

    const certificateId = `DLI-RTO-${new Date().getFullYear()}-${String(booking.id).padStart(6, '0')}`;
    const issueDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const totalSessions = booking.attendance?.length || booking.course?.durationDays || 15;

    // Landscape A4 dimensions: 841.89 x 595.28
    const doc = new PDFDocument({
      margin: 0,
      size: 'A4',
      layout: 'landscape',
      info: {
        Title: `DriveLearn Certificate - ${booking.learner?.name}`,
        Author: 'DriveLearn India National Driving Certification Council',
        Subject: 'Certificate of Driver Training & Competency',
      },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=DriveLearn-Certificate-${booking.learner?.name?.replace(/\s+/g, '_')}-${booking.id}.pdf`);
    doc.pipe(res);

    const W = doc.page.width;
    const H = doc.page.height;

    // 1. Background Fill (Soft Ivory / Cream Linen)
    doc.rect(0, 0, W, H).fill('#FCFBF7');

    // 2. Luxury Outer Double Border
    // Outer Deep Navy Border
    doc.rect(20, 20, W - 40, H - 40).lineWidth(4).stroke('#0B192C');

    // Inset Metallic Gold Ornamental Border
    doc.rect(28, 28, W - 56, H - 56).lineWidth(1.5).stroke('#C59B27');

    // Thin Accent Line
    doc.rect(32, 32, W - 64, H - 64).lineWidth(0.5).stroke('#E4D3A2');

    // 3. Corner Ornamental Diamonds
    const drawCornerDiamond = (x, y) => {
      doc.save();
      doc.polygon([x, y - 6], [x + 6, y], [x, y + 6], [x - 6, y]).fillAndStroke('#C59B27', '#0B192C');
      doc.restore();
    };
    drawCornerDiamond(30, 30);
    drawCornerDiamond(W - 30, 30);
    drawCornerDiamond(30, H - 30);
    drawCornerDiamond(W - 30, H - 30);

    // 4. Header Badge & Organization
    doc.fontSize(9).fillColor('#7A6B43')
      .text('DRIVELEARN INDIA NATIONAL DRIVER TRAINING ACCREDITATION', 0, 48, {
        align: 'center',
        characterSpacing: 2.5,
      });

    doc.fontSize(8).fillColor('#8B929A')
      .text('RECOGNIZED MOTOR DRIVING TRAINING COMPLIANCE · CENTRAL MOTOR VEHICLES RULES FORM 5 EQUIVALENT', 0, 62, {
        align: 'center',
        characterSpacing: 1.2,
      });

    // Decorative Gold Divider
    doc.moveTo(W / 2 - 120, 76).lineTo(W / 2 + 120, 76).lineWidth(1.5).stroke('#C59B27');
    doc.polygon([W / 2, 73], [W / 2 + 4, 76], [W / 2, 79], [W / 2 - 4, 76]).fill('#C59B27');

    // 5. Main Title
    doc.fontSize(26).fillColor('#0B192C')
      .font('Helvetica-Bold')
      .text('CERTIFICATE OF DRIVING COMPETENCY', 0, 92, {
        align: 'center',
        characterSpacing: 1.5,
      });

    doc.fontSize(10).fillColor('#7A6B43')
      .font('Helvetica-Oblique')
      .text('This is to officially certify that', 0, 126, { align: 'center' });

    // 6. Recipient Name with Royal Styling
    const recipientName = (booking.learner?.name || 'Driver Trainee').toUpperCase();
    doc.fontSize(24).fillColor('#0B192C')
      .font('Helvetica-Bold')
      .text(recipientName, 0, 146, { align: 'center' });

    // Elegant Underline for Name
    const nameWidth = Math.min(360, recipientName.length * 14);
    doc.moveTo(W / 2 - nameWidth / 2, 176).lineTo(W / 2 + nameWidth / 2, 176).lineWidth(1.2).stroke('#C59B27');

    // 7. Course & Driving School Details
    const courseTitle = booking.course?.title || 'Comprehensive Motor Driving Course';
    const schoolName = booking.course?.school?.name || 'Authorized Driving Academy';
    const schoolCity = booking.course?.school?.city || 'India';
    const instructorName = booking.instructor?.user?.name || 'Certified Senior Instructor';

    doc.fontSize(11).fillColor('#334155')
      .font('Helvetica')
      .text(
        `has successfully completed all prescribed practical driving sessions, vehicular control modules, and highway safety training for the course:`,
        60,
        188,
        { align: 'center', width: W - 120, lineGap: 3 }
      );

    doc.fontSize(14).fillColor('#C59B27')
      .font('Helvetica-Bold')
      .text(`"${courseTitle}"`, 60, 214, { align: 'center', width: W - 120 });

    doc.fontSize(10.5).fillColor('#475569')
      .font('Helvetica')
      .text(
        `Conducted at ${schoolName} (${schoolCity}) · Under Master Instructor ${instructorName} · Total ${totalSessions} Logged Practical Sessions`,
        60,
        234,
        { align: 'center', width: W - 120 }
      );

    // 8. Competency Verification Badges & Skills Matrix Box
    const boxX = 60;
    const boxY = 260;
    const boxW = W - 120;
    const boxH = 92;

    doc.rect(boxX, boxY, boxW, boxH).fillAndStroke('#F8F9FA', '#E2E8F0');

    doc.fontSize(9.5).fillColor('#0B192C')
      .font('Helvetica-Bold')
      .text('VERIFIED DRIVER SKILL COMPETENCIES & SAFETY ENDORSEMENTS', boxX + 16, boxY + 10);

    const skillsCol1 = [
      '✓ Dual-Control Clutch, Gear & Incline Biting Point Mastery',
      '✓ RTO Track Maneuvers: Parallel Parking, 8-Track & S-Reverse',
      '✓ Defensive Hazard Perception & Heavy Traffic Navigation',
    ];

    const skillsCol2 = [
      '✓ Central Motor Vehicles Rules & Official Road Sign Literacy',
      '✓ Emergency Braking, Distance Judgment & Mirror Checks',
      '✓ Night Driving & All-Weather Safety Protocol Certified',
    ];

    doc.fontSize(8.5).fillColor('#334155').font('Helvetica');
    skillsCol1.forEach((sk, i) => {
      doc.text(sk, boxX + 16, boxY + 30 + i * 18);
    });
    skillsCol2.forEach((sk, i) => {
      doc.text(sk, boxX + boxW / 2 + 10, boxY + 30 + i * 18);
    });

    // 9. Signatures & Official Golden Stamp Seal
    const sigY = 385;

    // Left Signature: Licensed Chief Instructor
    doc.moveTo(80, sigY + 50).lineTo(260, sigY + 50).lineWidth(1).stroke('#94A3B8');
    doc.fontSize(11).fillColor('#1E293B').font('Helvetica-BoldOblique')
      .text(instructorName, 80, sigY + 32, { width: 180, align: 'center' });
    doc.fontSize(8.5).fillColor('#64748B').font('Helvetica-Bold')
      .text('AUTHORIZED INSTRUCTOR', 80, sigY + 56, { width: 180, align: 'center' });
    doc.fontSize(7.5).fillColor('#94A3B8').font('Helvetica')
      .text('Licensed by State Transport Dept', 80, sigY + 68, { width: 180, align: 'center' });

    // Center Gold Seal / Emblem
    const sealCenterX = W / 2;
    const sealCenterY = sigY + 40;

    doc.circle(sealCenterX, sealCenterY, 34).lineWidth(2).stroke('#C59B27');
    doc.circle(sealCenterX, sealCenterY, 30).lineWidth(0.8).stroke('#D4AF37');
    doc.circle(sealCenterX, sealCenterY, 28).fill('#FFFDF5');

    doc.fontSize(7).fillColor('#7A6B43').font('Helvetica-Bold')
      .text('DRIVELEARN', sealCenterX - 26, sealCenterY - 14, { width: 52, align: 'center' });
    doc.fontSize(6).fillColor('#C59B27')
      .text('★ VERIFIED ★', sealCenterX - 26, sealCenterY - 4, { width: 52, align: 'center' });
    doc.fontSize(6).fillColor('#64748B')
      .text('RTO COMPLIANT', sealCenterX - 26, sealCenterY + 4, { width: 52, align: 'center' });
    doc.fontSize(5.5).fillColor('#94A3B8')
      .text('NATIONAL SEAL', sealCenterX - 26, sealCenterY + 12, { width: 52, align: 'center' });

    // Right Signature: Academy Principal / Certifying Authority
    doc.moveTo(W - 260, sigY + 50).lineTo(W - 80, sigY + 50).lineWidth(1).stroke('#94A3B8');
    doc.fontSize(11).fillColor('#1E293B').font('Helvetica-BoldOblique')
      .text('Govt. Recognized Principal', W - 260, sigY + 32, { width: 180, align: 'center' });
    doc.fontSize(8.5).fillColor('#64748B').font('Helvetica-Bold')
      .text('DIRECTOR OF DRIVER EDUCATION', W - 260, sigY + 56, { width: 180, align: 'center' });
    doc.fontSize(7.5).fillColor('#94A3B8').font('Helvetica')
      .text('DriveLearn India National Council', W - 260, sigY + 68, { width: 180, align: 'center' });

    // 10. Security Verification Footer Bar
    doc.rect(40, H - 55, W - 80, 24).fill('#0B192C');

    doc.fontSize(8).fillColor('#FFFFFF').font('Helvetica-Bold')
      .text(`CERTIFICATE SERIAL: ${certificateId}`, 54, H - 47);

    doc.fontSize(8).fillColor('#FDE047').font('Helvetica')
      .text(`ISSUED ON: ${issueDate}`, W / 2 - 60, H - 47, { width: 120, align: 'center' });

    doc.fontSize(7.5).fillColor('#E2E8F0').font('Helvetica')
      .text('VERIFY AUTHENTICITY: drivelearn.in/verify', W - 260, H - 47, { width: 200, align: 'right' });

    doc.end();
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({ error: 'Something went wrong generating the certificate' });
  }
};

module.exports = { downloadCertificate };