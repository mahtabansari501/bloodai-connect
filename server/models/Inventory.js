import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resourceType: { type: String, enum: ['blood', 'medicine'], required: true },
  name: { type: String, required: true }, // e.g., "O- Blood", "Paracetamol"
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true }, // e.g., "pints", "mg", "tablets"
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
