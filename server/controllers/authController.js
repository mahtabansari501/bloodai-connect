import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import SOSAlert from '../models/SOSAlert.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bloodai_super_secret_key_123';

const getUserStats = async (user) => {
  let stats = { donated: 0, requested: 0, inventoryItems: 0, sosResolved: 0 };
  if (['hospital', 'organization', 'pharmacy'].includes(user.role)) {
    stats.inventoryItems = await Inventory.countDocuments({ hospitalId: user._id });
    stats.sosResolved = await SOSAlert.countDocuments({ requesterId: user._id, status: 'resolved' });
  } else {
    stats.requested = await SOSAlert.countDocuments({ requesterId: user._id });
    stats.donated = user.donationsCount || 0;
  }
  return stats;
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, contactNumber, address, lat, lng, bloodGroup } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'donor',
      contactNumber,
      bloodGroup,
      location: {
        address,
        lat,
        lng
      }
    });

    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const expiresIn = rememberMe ? '30d' : '1h';

    jwt.sign(payload, JWT_SECRET, { expiresIn }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const stats = await getUserStats(user);
    res.json({ ...user.toObject(), stats });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.avatar = avatar;
    await user.save();
    res.json({ message: 'Avatar updated successfully', avatar: user.avatar });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const stats = await getUserStats(user);
    res.json({ ...user.toObject(), stats });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { contactNumber, bloodGroup, address, isAvailable } = req.body;
    
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (contactNumber !== undefined) user.contactNumber = contactNumber;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (address !== undefined) {
      if (!user.location) {
        user.location = { address };
      } else {
        user.location.address = address;
      }
    }
    if (isAvailable !== undefined) user.isAvailable = isAvailable;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};
