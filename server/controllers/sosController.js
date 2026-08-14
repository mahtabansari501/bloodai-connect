import SOSAlert from '../models/SOSAlert.js';

export const getActiveSOS = async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ status: 'active' })
      .populate('requesterId', 'name contactNumber role')
      .populate('acceptedBy', 'name contactNumber bloodGroup avatar')
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SOS alerts' });
  }
};

export const createSOSAlert = async (req, res) => {
  try {
    const { 
      requesterId, patientName, hospitalName, bloodGroup, unitsRequired, 
      contactName, contactPhone, resourceType, details, urgency, location,
      guestName, guestContact 
    } = req.body;
    
    const alert = new SOSAlert({ 
      requesterId, patientName, hospitalName, bloodGroup, unitsRequired,
      contactName, contactPhone, resourceType, details, urgency, location,
      guestName, guestContact
    });
    
    await alert.save();
    
    // Broadcast the new alert to all connected clients
    const populatedAlert = await SOSAlert.findById(alert._id).populate('requesterId', 'name contactNumber role');
    const io = req.app.get('io');
    if (io) {
        io.emit('new_sos_alert', populatedAlert);
    }
    
    res.json({ message: 'SOS Alert created successfully', alert: populatedAlert });
  } catch (error) {
    console.error("SOS POST Error:", error);
    res.status(500).json({ error: 'Failed to create SOS alert' });
  }
};

export const acceptSOSAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // From auth middleware

    const alert = await SOSAlert.findById(id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    
    // Make sure acceptedBy is an array
    if (!alert.acceptedBy) {
      alert.acceptedBy = [];
    }

    const hasAccepted = alert.acceptedBy.some(accId => accId.toString() === userId.toString());
    
    if (hasAccepted) {
      return res.status(400).json({ error: 'You have already accepted this SOS' });
    }

    alert.acceptedBy.push(userId);
    await alert.save();

    const populatedAlert = await SOSAlert.findById(id)
      .populate('requesterId', 'name contactNumber role')
      .populate('acceptedBy', 'name contactNumber bloodGroup avatar');
    
    // Broadcast updated alert
    const io = req.app.get('io');
    if (io) {
        io.emit('sos_updated', populatedAlert);
    }
    
    res.json({ message: 'Thank you for accepting to donate!', alert: populatedAlert });
  } catch (error) {
    console.error("SOS Accept Error:", error);
    res.status(500).json({ error: 'Failed to accept SOS alert' });
  }
};

export const resolveSOSAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await SOSAlert.findByIdAndUpdate(id, { status: 'resolved' }, { new: true });
    
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    
    // Broadcast that this alert is resolved
    const io = req.app.get('io');
    if (io) {
        io.emit('sos_resolved', { alertId: id });
    }
    
    res.json({ message: 'Alert resolved successfully', alert });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve SOS alert' });
  }
};

export const withdrawSOSAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const alert = await SOSAlert.findById(id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    
    if (!alert.acceptedBy) {
      alert.acceptedBy = [];
    }

    alert.acceptedBy = alert.acceptedBy.filter(accId => accId.toString() !== userId.toString());
    await alert.save();

    const populatedAlert = await SOSAlert.findById(id)
      .populate('requesterId', 'name contactNumber role')
      .populate('acceptedBy', 'name contactNumber bloodGroup avatar');
    
    const io = req.app.get('io');
    if (io) {
        io.emit('sos_updated', populatedAlert);
    }
    
    res.json({ message: 'You have withdrawn your help.', alert: populatedAlert });
  } catch (error) {
    console.error("SOS Withdraw Error:", error);
    res.status(500).json({ error: 'Failed to withdraw from SOS alert' });
  }
};
