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
        instructor: { include: { user: { select: { name: true } } } },
      },
    });

    if (!booking || booking.learnerId !== learnerId) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Certificate is only available once the course is marked completed' });
    }

    const certificateId = `DLI-CERT-${booking.id}-${new Date().getFullYear()}`;

    const doc = new PDFDocument({ margin: 0, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${booking.id}.pdf`);
    doc.pipe(res);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    doc.rect(24, 24, pageWidth - 48, pageHeight - 48).lineWidth(3).stroke('#1C1F22');
    doc.rect(34, 34, pageWidth - 68, pageHeight - 68).lineWidth(1).stroke('#F2B705');

    doc.fontSize(12).fillColor('#8B929A')
      .text('DRIVELEARN INDIA', 0, 70, { align: 'center', characterSpacing: 3 });

    doc.fontSize(34).fillColor('#1C1F22')
      .text('Certificate of Completion', 0, 100, { align: 'center' });

    doc.moveTo(pageWidth / 2 - 80, 150).lineTo(pageWidth / 2 + 80, 150).lineWidth(2).stroke('#F2B705');

    doc.fontSize(13).fillColor('#6B7680')
      .text('This certifies that', 0, 175, { align: 'center' });

    doc.fontSize(28).fillColor('#1C1F22')
      .text(booking.learner.name, 0, 200, { align: 'center' });

    doc.fontSize(13).fillColor('#6B7680')
      .text(
        `has successfully completed the "${booking.course.title}" course`,
        80, 245, { align: 'center', width: pageWidth - 160 }
      );
    doc.text(
      `at ${booking.course.school.name}, under the guidance of ${booking.instructor.user.name}.`,
      80, 265, { align: 'center', width: pageWidth - 160 }
    );

    const completionDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    doc.fontSize(10).fillColor('#8B929A')
      .text(`Issued on ${completionDate}`, 0, 320, { align: 'center' });

    doc.fontSize(9).fillColor('#8B929A')
      .text(`Certificate ID: ${certificateId}`, 60, pageHeight - 70);
    doc.text('DriveLearn India — A Unit of BTOW Pvt. Ltd.', 0, pageHeight - 70, { align: 'right', width: pageWidth - 120 });

    doc.end();
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({ error: 'Something went wrong generating the certificate' });
  }
};

module.exports = { downloadCertificate };