import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { store, generateId } from '../services/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'replate_jwt_secret_dev_cbit_novanex_2026';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'donor',
      organizationName,
      donorType,
      ngoType,
      contactPerson,
      serviceArea,
      address,
      phone,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = store.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    let organizationId = null;

    // Create organization profile if organizationName is provided or required for role
    if (organizationName && (role === 'donor' || role === 'ngo' || role === 'volunteer')) {
      const orgType = role === 'donor' ? (donorType || 'Restaurant') : role === 'ngo' ? (ngoType || 'NGO / Community Kitchen') : 'Logistics Partner';
      const newOrg = store.create('organizations', {
        name: organizationName,
        type: orgType,
        contactPerson: contactPerson || name,
        email: email.toLowerCase(),
        phone: phone || '',
        serviceArea: serviceArea || 'Gandipet / Hyderabad',
        address: address || 'Hyderabad, Telangana',
        coordinates: { lat: 17.3916, lng: 78.3194 },
        verificationStatus: 'verified', // Auto-verify demo accounts for frictionless hackathon trial
        capacityDescription: `Registered via REPLATE portal for ${orgType}`,
      });
      organizationId = newOrg._id;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = store.create('users', {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      organizationId,
      phone: phone || '',
      status: 'active',
    });

    const token = generateToken(newUser);
    const org = organizationId ? store.findById('organizations', organizationId) : null;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        organization: org,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Failed to register account.', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = store.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const org = user.organizationId ? store.findById('organizations', user.organizationId) : null;

    res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organization: org,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed.', error: err.message });
  }
};

export const demoLogin = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['donor', 'ngo', 'volunteer', 'admin'];

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid demo role. Choose one of: ${validRoles.join(', ')}` });
    }

    // Find the standard demo account for this role
    const emailMap = {
      donor: 'donor@replate.org',
      ngo: 'ngo@replate.org',
      volunteer: 'volunteer@replate.org',
      admin: 'admin@replate.org',
    };

    const targetEmail = emailMap[role];
    let user = store.getUsers().find((u) => u.email.toLowerCase() === targetEmail);

    if (!user) {
      // Find any user with that role
      user = store.getUsers().find((u) => u.role === role);
    }

    if (!user) {
      // Re-seed if missing
      await store.seedDefaults();
      user = store.getUsers().find((u) => u.email.toLowerCase() === targetEmail);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: `Demo user for role ${role} not found.` });
    }

    const token = generateToken(user);
    const org = user.organizationId ? store.findById('organizations', user.organizationId) : null;

    res.json({
      success: true,
      message: `Signed in as Demo ${role.toUpperCase()} successfully.`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organization: org,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Demo sign-in failed.', error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = store.findById('users', req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const org = user.organizationId ? store.findById('organizations', user.organizationId) : null;

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organization: org,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.', error: err.message });
  }
};
