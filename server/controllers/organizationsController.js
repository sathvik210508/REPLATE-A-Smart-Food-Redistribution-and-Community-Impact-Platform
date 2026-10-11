import { store } from '../services/store.js';

export const getOrganizations = async (req, res) => {
  try {
    const { type, verificationStatus } = req.query;
    let list = store.getOrganizations();

    if (type && type !== 'All') {
      list = list.filter((o) => o.type === type);
    }

    if (verificationStatus) {
      list = list.filter((o) => o.verificationStatus === verificationStatus);
    }

    res.json({
      success: true,
      count: list.length,
      organizations: list,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve organizations.', error: err.message });
  }
};

export const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;
    const org = store.findById('organizations', id);

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    res.json({
      success: true,
      organization: org,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve organization.', error: err.message });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const org = store.findById('organizations', id);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    const updated = store.findByIdAndUpdate('organizations', id, updates);

    res.json({
      success: true,
      message: 'Organization profile updated.',
      organization: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update organization.', error: err.message });
  }
};
