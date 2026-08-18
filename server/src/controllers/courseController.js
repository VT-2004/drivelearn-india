const prisma = require('../utils/prismaClient');

// SCHOOL OWNER or INSTRUCTOR: Add a course
const addCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { title, description, price, durationDays, instructorId } = req.body;

    if (!title || !price || !durationDays) {
      return res.status(400).json({ error: 'Title, price, and duration are required' });
    }

    let targetSchoolId;
    let targetInstructorId = null;

    if (role === 'instructor') {
      const instructor = await prisma.instructor.findUnique({ where: { userId } });
      if (!instructor) {
        return res.status(404).json({ error: 'Instructor profile not found' });
      }
      targetSchoolId = instructor.schoolId;
      targetInstructorId = instructor.id;
    } else if (role === 'school_owner') {
      const school = await prisma.drivingSchool.findUnique({ where: { ownerId: userId } });
      if (!school) {
        return res.status(404).json({ error: 'You must register a school first' });
      }
      targetSchoolId = school.id;
      targetInstructorId = instructorId ? parseInt(instructorId) : null;
    } else {
      return res.status(403).json({ error: 'Unauthorized role for course creation' });
    }

    const courseData = {
      schoolId: targetSchoolId,
      title,
      description: description || null,
      price: parseFloat(price),
      durationDays: parseInt(durationDays),
    };

    if (targetInstructorId) {
      courseData.instructorId = targetInstructorId;
    }

    const course = await prisma.course.create({
      data: courseData,
    });

    res.status(201).json({ message: 'Course added successfully', course });
  } catch (error) {
    console.error('Add course error:', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
};

// SCHOOL OWNER or INSTRUCTOR: Get courses
const getMyCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (role === 'instructor') {
      const instructor = await prisma.instructor.findUnique({ where: { userId } });
      if (!instructor) {
        return res.status(404).json({ error: 'Instructor profile not found' });
      }

      const courses = await prisma.course.findMany({
        where: {
          OR: [
            { instructorId: instructor.id },
            { schoolId: instructor.schoolId, instructorId: null },
          ],
        },
        include: {
          school: { select: { name: true, city: true } },
        },
        orderBy: { id: 'desc' },
      });

      return res.json({ courses });
    }

    if (role === 'school_owner') {
      const school = await prisma.drivingSchool.findUnique({ where: { ownerId: userId } });
      if (!school) {
        return res.status(404).json({ error: 'No school registered yet' });
      }

      const courses = await prisma.course.findMany({
        where: { schoolId: school.id },
        include: {
          instructor: { include: { user: { select: { name: true } } } },
        },
        orderBy: { id: 'desc' },
      });

      return res.json({ courses });
    }

    res.status(403).json({ error: 'Unauthorized' });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// SCHOOL OWNER or INSTRUCTOR: Update a course
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;
    const { title, description, price, durationDays, instructorId } = req.body;

    const course = await prisma.course.findUnique({ where: { id: parseInt(id) } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (role === 'instructor') {
      const instructor = await prisma.instructor.findUnique({ where: { userId } });
      if (!instructor || course.instructorId !== instructor.id) {
        return res.status(403).json({ error: 'Not authorized to edit this course' });
      }
    } else if (role === 'school_owner') {
      const school = await prisma.drivingSchool.findUnique({ where: { ownerId: userId } });
      if (!school || course.schoolId !== school.id) {
        return res.status(403).json({ error: 'Not authorized to edit this course' });
      }
    } else {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData = {
      title: title ?? course.title,
      description: description ?? course.description,
      price: price ? parseFloat(price) : course.price,
      durationDays: durationDays ? parseInt(durationDays) : course.durationDays,
    };

    if (instructorId !== undefined) {
      updateData.instructorId = instructorId ? parseInt(instructorId) : null;
    }

    const updated = await prisma.course.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json({ message: 'Course updated', course: updated });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// SCHOOL OWNER or INSTRUCTOR: Delete a course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const course = await prisma.course.findUnique({ where: { id: parseInt(id) } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (role === 'instructor') {
      const instructor = await prisma.instructor.findUnique({ where: { userId } });
      if (!instructor || course.instructorId !== instructor.id) {
        return res.status(403).json({ error: 'Not authorized to delete this course' });
      }
    } else if (role === 'school_owner') {
      const school = await prisma.drivingSchool.findUnique({ where: { ownerId: userId } });
      if (!school || course.schoolId !== school.id) {
        return res.status(403).json({ error: 'Not authorized to delete this course' });
      }
    } else {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.course.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { addCourse, getMyCourses, updateCourse, deleteCourse };
