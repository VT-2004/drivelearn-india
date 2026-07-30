const prisma = require('../utils/prismaClient');

// SCHOOL OWNER: Add a course
const addCourse = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { title, description, price, durationDays } = req.body;

    if (!title || !price || !durationDays) {
      return res.status(400).json({ error: 'Title, price, and duration are required' });
    }

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school) {
      return res.status(404).json({ error: 'You must register a school first' });
    }

    const course = await prisma.course.create({
      data: {
        schoolId: school.id,
        title,
        description,
        price: parseFloat(price),
        durationDays: parseInt(durationDays),
      },
    });

    res.status(201).json({ message: 'Course added successfully', course });
  } catch (error) {
    console.error('Add course error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// SCHOOL OWNER: Get my courses
const getMyCourses = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school) {
      return res.status(404).json({ error: 'No school registered yet' });
    }

    const courses = await prisma.course.findMany({
      where: { schoolId: school.id },
      orderBy: { id: 'desc' },
    });

    res.json({ courses });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// SCHOOL OWNER: Update a course
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const { title, description, price, durationDays } = req.body;

    const course = await prisma.course.findUnique({ where: { id: parseInt(id) } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school || course.schoolId !== school.id) {
      return res.status(403).json({ error: 'Not authorized to edit this course' });
    }

    const updated = await prisma.course.update({
      where: { id: parseInt(id) },
      data: {
        title: title ?? course.title,
        description: description ?? course.description,
        price: price ? parseFloat(price) : course.price,
        durationDays: durationDays ? parseInt(durationDays) : course.durationDays,
      },
    });

    res.json({ message: 'Course updated', course: updated });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// SCHOOL OWNER: Delete a course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    const course = await prisma.course.findUnique({ where: { id: parseInt(id) } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school || course.schoolId !== school.id) {
      return res.status(403).json({ error: 'Not authorized to delete this course' });
    }

    await prisma.course.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { addCourse, getMyCourses, updateCourse, deleteCourse };
