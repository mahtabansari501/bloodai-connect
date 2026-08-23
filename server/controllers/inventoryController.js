import Inventory from '../models/Inventory.js';

export const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('hospitalId', 'name address contactNumber role rating ratingCount');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

export const addOrUpdateInventory = async (req, res) => {
  try {
    const { hospitalId, resourceType, name, quantity, quantityChange, unit } = req.body;
    
    let item = await Inventory.findOne({ hospitalId, name, resourceType });
    
    if (item) {
      if (quantityChange !== undefined) {
        item.quantity = Math.max(0, item.quantity + Number(quantityChange));
      } else if (quantity !== undefined) {
        item.quantity = Number(quantity);
      }
      item.lastUpdated = Date.now();
      await item.save();
    } else {
      let initialQty = 0;
      if (quantityChange !== undefined) {
        initialQty = Math.max(0, Number(quantityChange));
      } else if (quantity !== undefined) {
        initialQty = Number(quantity);
      }
      item = new Inventory({ hospitalId, resourceType, name, quantity: initialQty, unit });
      await item.save();
    }
    
    // Broadcast the update to all clients
    const io = req.app.get('io');
    const updatedInventory = await Inventory.find().populate('hospitalId', 'name address contactNumber role rating ratingCount');
    if (io) {
        io.emit('inventory_update', updatedInventory);
    }
    
    res.json({ message: 'Inventory updated successfully', item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inventory' });
  }
};
