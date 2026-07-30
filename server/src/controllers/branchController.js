const prisma = require('../utils/prismaClient');

// SCHOOL OWNER: Add a branch to their school
const addBranch = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { city, state, address } = req.body;

    if (!city || !state || !address) {
      return res.status(400).json({ error: 'City, state, and address are required' });
    }

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school) {
      return res.status(404).json({ error: 'You must register a school first' });
    }

    const branch = await prisma.branch.create({
      data: {
        schoolId: school.id,
        city,
        state,
        address,
      },
    });

    res.status(201).json({ message: 'Branch added successfully', branch });
  } catch (error) {
    console.error('Add branch error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// SCHOOL OWNER: Get all branches for my school
const getMyBranches = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school) {
      return res.status(404).json({ error: 'No school registered yet' });
    }

    const branches = await prisma.branch.findMany({
      where: { schoolId: school.id },
    });

    res.json({ branches });
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// SCHOOL OWNER: Delete a branch
const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    // Confirm this branch belongs to the logged-in owner's school
    const branch = await prisma.branch.findUnique({ where: { id: parseInt(id) } });
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    const school = await prisma.drivingSchool.findUnique({ where: { ownerId } });
    if (!school || branch.schoolId !== school.id) {
      return res.status(403).json({ error: 'Not authorized to delete this branch' });
    }

    await prisma.branch.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { addBranch, getMyBranches, deleteBranch };
