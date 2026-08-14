import mongoose from 'mongoose';

const sosAlertSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  
  // New specific fields
  patientName: { type: String, required: false },
  hospitalName: { type: String, required: false },
  bloodGroup: { type: String, required: false }, // Only required if resourceType is 'blood'
  unitsRequired: { type: Number, default: 1 },
  contactName: { type: String, required: false },
  contactPhone: { type: String, required: false },

  // Old fields
  guestName: { type: String, required: false }, // Deprecated but kept for backward compatibility
  guestContact: { type: String, required: false }, // Deprecated but kept for backward compatibility
  resourceType: { type: String, enum: ['blood', 'medicine', 'other'], required: true },
  details: { type: String, required: false },
  urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'high' },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  
  // Fulfillment tracking
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  acceptedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const SOSAlert = mongoose.model('SOSAlert', sosAlertSchema);
export default SOSAlert;
