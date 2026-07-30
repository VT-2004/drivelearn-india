const bcrypt = require('bcrypt');
const prisma = require('../utils/prismaClient');

// SCHOOL OWNER: Add a new instructor (creates a User account + Instructor profile)
const addInstructor = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { name, email, password, phone, specialization, experienceYears } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Name, email, password, and phone are required' });
    }

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school) {
      return res.status(404).json({ error: 'You must register a school first' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'This email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the User account (role: instructor) and Instructor profile together
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'instructor',
        instructor: {
          create: {
            schoolId: school.id,
            specialization: specialization || null,
            experienceYears: experienceYears ? parseInt(experienceYears) : null,
          },
        },
      },
      include: { instructor: true },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'Instructor added successfully',
      instructor: userWithoutPassword,
    });
  } catch (error) {
    console.error('Add instructor error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// SCHOOL OWNER: Get all instructors for my school
const getInstructors = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school) {
      return res.status(404).json({ error: 'No school registered yet' });
    }

    const instructors = await prisma.instructor.findMany({
      where: { schoolId: school.id },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    });

    res.json({ instructors });
  } catch (error) {
    console.error('Get instructors error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// SCHOOL OWNER: Remove an instructor
const deleteInstructor = async (req, res) => {
  try {
    const { id } = req.params; // this is the Instructor record id
    const ownerId = req.user.id;

    const instructor = await prisma.instructor.findUnique({ where: { id: parseInt(id) } });
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school || instructor.schoolId !== school.id) {
      return res.status(403).json({ error: 'Not authorized to remove this instructor' });
    }

    // Delete the Instructor record (the User account remains, just detached)
    await prisma.instructor.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Instructor removed successfully' });
  } catch (error) {
    console.error('Delete instructor error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { addInstructor, getInstructors, deleteInstructor };
