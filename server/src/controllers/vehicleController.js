const prisma = require('../utils/prismaClient');

// Seed default fleet if empty
const seedDefaultFleet = async (schoolId, firstInstructorId) => {
  const defaultVehicles = [
    {
      schoolId,
      instructorId: firstInstructorId || null,
      regNumber: 'OD-02-AB-4471',
      type: '4-Wheeler',
      model: 'Maruti Suzuki Swift (VXi)',
      transmission: 'Manual',
      fuelType: 'Petrol + CNG',
      dualControlStatus: 'Certified Dual-Control',
      insuranceValidity: new Date('2027-03-31'),
      insurancePolicyNo: 'BA-MTR-88912300',
      fitnessValidity: new Date('2027-04-15'),
      pucValidity: new Date('2026-12-31'),
      status: 'In Service',
    },
    {
      schoolId,
      instructorId: firstInstructorId || null,
      regNumber: 'OD-02-CD-9012',
      type: '4-Wheeler',
      model: 'Hyundai i20 (Sportz)',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      dualControlStatus: 'Certified Dual-Control',
      insuranceValidity: new Date('2026-11-30'),
      insurancePolicyNo: 'ICICI-MTR-4401928',
      fitnessValidity: new Date('2027-01-20'),
      pucValidity: new Date('2026-10-15'),
      status: 'In Service',
    },
    {
      schoolId,
      instructorId: firstInstructorId || null,
      regNumber: 'OD-02-EF-3345',
      type: '2-Wheeler',
      model: 'Honda Activa 6G (DLX)',
      transmission: 'Automatic Scooter',
      fuelType: 'Petrol',
      dualControlStatus: 'N/A (2-Wheeler)',
      insuranceValidity: new Date('2026-09-15'),
      insurancePolicyNo: 'NIC-2W-1100293',
      fitnessValidity: new Date('2027-08-10'),
      pucValidity: new Date('2026-09-01'),
      status: 'Maintenance',
    },
    {
      schoolId,
      instructorId: firstInstructorId || null,
      regNumber: 'OD-02-GH-7788',
      type: '4-Wheeler',
      model: 'Tata Tiago (XZ+)',
      transmission: 'Manual',
      fuelType: 'Petrol',
      dualControlStatus: 'Certified Dual-Control',
      insuranceValidity: new Date('2027-01-15'),
      insurancePolicyNo: 'HDFC-ERGO-992019',
      fitnessValidity: new Date('2027-03-10'),
      pucValidity: new Date('2026-12-15'),
      status: 'In Service',
    },
  ];

  await prisma.vehicle.createMany({ data: defaultVehicles });
};

// GET all vehicles for school
const getSchoolVehicles = async (req, res) => {
  try {
    const school = await prisma.drivingSchool.findUnique({
      where: { ownerId: req.user.id },
      include: { instructors: { include: { user: true } } },
    });

    if (!school) {
      return res.status(404).json({ error: 'Driving school not found' });
    }

    let vehicles = await prisma.vehicle.findMany({
      where: { schoolId: school.id },
      include: { instructor: { include: { user: true } } },
      orderBy: { id: 'asc' },
    });

    // If no vehicles in DB yet, seed initial fleet
    if (vehicles.length === 0) {
      const firstInstId = school.instructors[0]?.id || null;
      await seedDefaultFleet(school.id, firstInstId);
      vehicles = await prisma.vehicle.findMany({
        where: { schoolId: school.id },
        include: { instructor: { include: { user: true } } },
        orderBy: { id: 'asc' },
      });
    }

    res.json({ vehicles });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle fleet' });
  }
};

// POST add a vehicle
const addVehicle = async (req, res) => {
  try {
    const { regNumber, type, model, transmission, fuelType, dualControlStatus, instructorId, insuranceValidity, insurancePolicyNo, fitnessValidity, pucValidity, status } = req.body;

    const school = await prisma.drivingSchool.findUnique({
      where: { ownerId: req.user.id },
    });

    if (!school) {
      return res.status(404).json({ error: 'Driving school not found' });
    }

    if (!regNumber || !model) {
      return res.status(400).json({ error: 'Registration number and model are required' });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        schoolId: school.id,
        regNumber: regNumber.toUpperCase().trim(),
        type: type || '4-Wheeler',
        model: model.trim(),
        transmission: transmission || 'Manual',
        fuelType: fuelType || 'Petrol',
        dualControlStatus: dualControlStatus || 'Certified Dual-Control',
        instructorId: instructorId ? parseInt(instructorId) : null,
        insuranceValidity: insuranceValidity ? new Date(insuranceValidity) : null,
        insurancePolicyNo: insurancePolicyNo || null,
        fitnessValidity: fitnessValidity ? new Date(fitnessValidity) : null,
        pucValidity: pucValidity ? new Date(pucValidity) : null,
        status: status || 'In Service',
      },
      include: { instructor: { include: { user: true } } },
    });

    res.status(201).json({ message: 'Vehicle added successfully', vehicle });
  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({ error: 'Failed to add vehicle' });
  }
};

// PUT update vehicle (status, instructor assignment, dates)
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, instructorId, insuranceValidity, fitnessValidity, pucValidity, dualControlStatus, model, transmission, fuelType } = req.body;

    const school = await prisma.drivingSchool.findUnique({
      where: { ownerId: req.user.id },
    });

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(id) },
    });

    if (!vehicle || vehicle.schoolId !== school.id) {
      return res.status(404).json({ error: 'Vehicle not found or unauthorized' });
    }

    const updated = await prisma.vehicle.update({
      where: { id: parseInt(id) },
      data: {
        ...(status && { status }),
        ...(instructorId !== undefined && { instructorId: instructorId ? parseInt(instructorId) : null }),
        ...(insuranceValidity && { insuranceValidity: new Date(insuranceValidity) }),
        ...(fitnessValidity && { fitnessValidity: new Date(fitnessValidity) }),
        ...(pucValidity && { pucValidity: new Date(pucValidity) }),
        ...(dualControlStatus && { dualControlStatus }),
        ...(model && { model }),
        ...(transmission && { transmission }),
        ...(fuelType && { fuelType }),
      },
      include: { instructor: { include: { user: true } } },
    });

    res.json({ message: 'Vehicle updated successfully', vehicle: updated });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
};

// DELETE vehicle
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const school = await prisma.drivingSchool.findUnique({
      where: { ownerId: req.user.id },
    });

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(id) },
    });

    if (!vehicle || vehicle.schoolId !== school.id) {
      return res.status(404).json({ error: 'Vehicle not found or unauthorized' });
    }

    await prisma.vehicle.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Vehicle removed from fleet' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
};

module.exports = {
  getSchoolVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
};
