import BloodCamp from '../models/BloodCamp.js';

export const getCamps = async (req, res) => {
  try {
    const camps = await BloodCamp.find().sort({ date: 1 });
    res.json(camps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blood camps' });
  }
};

export const createCamp = async (req, res) => {
  try {
    const camp = new BloodCamp(req.body);
    await camp.save();
    const io = req.app.get('io');
    if (io) {
        io.emit('new_camp', camp);
    }
    res.status(201).json(camp);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create blood camp' });
  }
};
