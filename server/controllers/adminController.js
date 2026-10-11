import { store } from '../services/store.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = store.getUsers().map((u) => {
      const org = u.organizationId ? store.findById('organizations', u.organizationId) : null;
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        status: u.status,
        organization: org ? { name: org.name, type: org.type, serviceArea: org.serviceArea } : null,
        createdAt: u.createdAt,
      };
    });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users.', error: err.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = store.findById('users', id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    const updated = store.findByIdAndUpdate('users', id, { status: nextStatus });

    res.json({
      success: true,
      message: `User status changed to ${nextStatus}.`,
      user: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        status: updated.status,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle user status.', error: err.message });
  }
};

export const setOrganizationVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus } = req.body;

    if (!['verified', 'pending', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status.' });
    }

    const org = store.findById('organizations', id);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    const updated = store.findByIdAndUpdate('organizations', id, { verificationStatus });

    res.json({
      success: true,
      message: `Organization verification status updated to ${verificationStatus}.`,
      organization: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update organization status.', error: err.message });
  }
};

export const getAllAuditLogs = async (req, res) => {
  try {
    const events = store.getEvents().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.', error: err.message });
  }
};

export const resetAndSeedData = async (req, res) => {
  try {
    await store.seedDefaults();
    res.json({
      success: true,
      message: 'Demo dataset reset and re-seeded successfully.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reset seed data.', error: err.message });
  }
};
