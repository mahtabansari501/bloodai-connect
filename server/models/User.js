import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['donor', 'hospital', 'pharmacy', 'admin', 'organization'], default: 'donor' },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] }, // For donors
  contactNumber: { type: String },
  avatar: { type: String },
  isAvailable: { type: Boolean, default: true },
  donationsCount: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  ratingCount: { type: Number, default: 1 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
