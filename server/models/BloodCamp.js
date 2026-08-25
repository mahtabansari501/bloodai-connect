import mongoose from 'mongoose';

const bloodCampSchema = new mongoose.Schema({
  organizerName: {
    type: String,
    required: true
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  contactNumber: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  location: {
    lat: Number,
    lng: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const BloodCamp = mongoose.model('BloodCamp', bloodCampSchema);
export default BloodCamp;
