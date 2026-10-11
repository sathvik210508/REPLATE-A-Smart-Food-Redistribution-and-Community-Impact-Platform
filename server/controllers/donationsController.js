import { store, generateId } from '../services/store.js';

export const getDonations = async (req, res) => {
  try {
    const { category, status, search, serviceArea, donorId, sort = 'recent' } = req.query;

    let items = store.getDonations();

    // Check & mark expired items dynamically
    const now = new Date();
    items.forEach((item) => {
      if (item.status === 'AVAILABLE' && new Date(item.safeConsumptionDeadline) < now) {
        store.findByIdAndUpdate('donations', item._id, { status: 'EXPIRED' });
      }
    });
    // refresh list
    items = store.getDonations();

    if (category && category !== 'All') {
      items = items.filter((d) => d.category === category);
    }

    if (status && status !== 'All') {
      items = items.filter((d) => d.status === status);
    }

    if (serviceArea && serviceArea !== 'All') {
      items = items.filter((d) => d.serviceArea.toLowerCase().includes(serviceArea.toLowerCase()));
    }

    if (donorId) {
      items = items.filter((d) => String(d.donorId) === String(donorId));
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.pickupLocation.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sort === 'deadline') {
      items.sort((a, b) => new Date(a.safeConsumptionDeadline) - new Date(b.safeConsumptionDeadline));
    } else if (sort === 'quantity') {
      items.sort((a, b) => b.quantity - a.quantity);
    } else {
      // Default: recent
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Populate organization & donor details
    const populated = items.map((d) => {
      const org = store.findById('organizations', d.organizationId);
      const recipient = d.assignedRecipientId ? store.findById('organizations', d.assignedRecipientId) : null;
      const volunteer = d.assignedVolunteerId ? store.findById('users', d.assignedVolunteerId) : null;
      return {
        ...d,
        organization: org,
        assignedRecipient: recipient,
        assignedVolunteer: volunteer ? { _id: volunteer._id, name: volunteer.name, phone: volunteer.phone } : null,
      };
    });

    res.json({
      success: true,
      count: populated.length,
      donations: populated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve donations.', error: err.message });
  }
};

export const getDonationById = async (req, res) => {
  try {
    const { id } = req.params;
    const donation = store.findById('donations', id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    const org = store.findById('organizations', donation.organizationId);
    const donorUser = store.findById('users', donation.donorId);
    const recipient = donation.assignedRecipientId ? store.findById('organizations', donation.assignedRecipientId) : null;
    const volunteer = donation.assignedVolunteerId ? store.findById('users', donation.assignedVolunteerId) : null;

    // Fetch related requests and events
    const requests = store.getRequests().filter((r) => String(r.donationId) === String(id)).map((r) => {
      const ngoOrg = store.findById('organizations', r.ngoId);
      const requester = store.findById('users', r.requestedByUserId);
      return {
        ...r,
        ngo: ngoOrg,
        requestedBy: requester ? { name: requester.name, email: requester.email } : null,
      };
    });

    const events = store.getEvents().filter((e) => String(e.donationId) === String(id)).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      success: true,
      donation: {
        ...donation,
        organization: org,
        donor: donorUser ? { name: donorUser.name, email: donorUser.email, phone: donorUser.phone } : null,
        assignedRecipient: recipient,
        assignedVolunteer: volunteer ? { _id: volunteer._id, name: volunteer.name, phone: volunteer.phone } : null,
        requests,
        events,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve donation details.', error: err.message });
  }
};

export const createDonation = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      quantity,
      unit = 'servings',
      isVegetarian = true,
      preparationTime,
      safeConsumptionDeadline,
      storageRequirements,
      allergenInfo,
      pickupLocation,
      serviceArea,
      pickupWindowStart,
      pickupWindowEnd,
      contactPerson,
      contactPhone,
      minAcceptQuantity = 1,
      recipientNotes = '',
    } = req.body;

    // Strict Validations
    if (!title || !category || !description || !quantity || !pickupLocation || !serviceArea) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required food details: Title, Category, Description, Quantity, Pickup Location, and Service Area.',
      });
    }

    const numericQty = Number(quantity);
    if (isNaN(numericQty) || numericQty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number greater than 0.' });
    }

    const prepDate = new Date(preparationTime || Date.now());
    const deadlineDate = new Date(safeConsumptionDeadline);
    const now = new Date();

    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid safe consumption deadline date/time.' });
    }

    if (deadlineDate <= now) {
      return res.status(400).json({
        success: false,
        message: 'Safe consumption deadline must be in the future. Cannot list expired food.',
      });
    }

    const winStart = new Date(pickupWindowStart || Date.now());
    const winEnd = new Date(pickupWindowEnd || deadlineDate);

    if (winEnd <= winStart) {
      return res.status(400).json({
        success: false,
        message: 'Pickup window end time must be after start time.',
      });
    }

    // Resolve organization
    const orgId = req.user.organizationId || (store.getOrganizations()[0]?._id);

    const newDonation = store.create('donations', {
      donorId: req.user._id,
      organizationId: orgId,
      title: title.trim(),
      category,
      description: description.trim(),
      quantity: numericQty,
      unit,
      isVegetarian: Boolean(isVegetarian),
      preparationTime: prepDate.toISOString(),
      safeConsumptionDeadline: deadlineDate.toISOString(),
      storageRequirements: storageRequirements || 'Keep at ambient holding temperature',
      allergenInfo: allergenInfo || 'None specified',
      pickupLocation: pickupLocation.trim(),
      serviceArea: serviceArea.trim(),
      pickupWindow: {
        start: winStart.toISOString(),
        end: winEnd.toISOString(),
      },
      contactPerson: contactPerson || req.user.name,
      contactPhone: contactPhone || req.user.phone || '+91 98490 12345',
      minAcceptQuantity: Number(minAcceptQuantity) || 1,
      recipientNotes,
      status: 'AVAILABLE',
      assignedRecipientId: null,
      assignedVolunteerId: null,
      matchedNgoCount: 2,
      requestCount: 0,
    });

    // Record creation event in audit timeline
    store.create('donationEvents', {
      donationId: newDonation._id,
      eventType: 'CREATED',
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: `Food Donor (${req.user.role})`,
      notes: `Published surplus food listing: ${newDonation.quantity} ${newDonation.unit} of "${newDonation.title}". Pickup deadline: ${deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      timestamp: new Date().toISOString(),
    });

    // Broadcast in-app notification to NGOs
    const ngoUsers = store.getUsers().filter((u) => u.role === 'ngo');
    ngoUsers.forEach((ngo) => {
      store.create('notifications', {
        recipientId: ngo._id,
        title: 'New Surplus Food Available!',
        message: `${newDonation.title} (${newDonation.quantity} ${newDonation.unit}) is now available in ${newDonation.serviceArea}.`,
        eventType: 'DONATION_AVAILABLE',
        donationId: newDonation._id,
        link: `/ngo/dashboard`,
        read: false,
      });
    });

    res.status(201).json({
      success: true,
      message: 'Surplus food listing published successfully.',
      donation: newDonation,
    });
  } catch (err) {
    console.error('Create donation error:', err);
    res.status(500).json({ success: false, message: 'Failed to create donation listing.', error: err.message });
  }
};

export const updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes = '' } = req.body;

    const donation = store.findById('donations', id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    const validStatuses = [
      'AVAILABLE',
      'REQUESTED',
      'ACCEPTED',
      'PICKED_UP',
      'COMPLETED',
      'REJECTED',
      'CANCELLED',
      'EXPIRED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    // Permission checks based on role
    const userRole = req.user.role;
    if (userRole === 'donor' && String(donation.donorId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this donation.' });
    }

    const updated = store.findByIdAndUpdate('donations', id, { status });

    // Map status to audit event
    const eventTypeMap = {
      ACCEPTED: 'REQUEST_ACCEPTED',
      PICKED_UP: 'FOOD_PICKED_UP',
      COMPLETED: 'COMPLETED',
      CANCELLED: 'CANCELLED',
    };

    const eventType = eventTypeMap[status] || status;

    store.create('donationEvents', {
      donationId: id,
      eventType,
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role.toUpperCase(),
      notes: notes || `Status updated to ${status}.`,
      timestamp: new Date().toISOString(),
    });

    // Notify donor & recipient
    if (updated.donorId && String(updated.donorId) !== String(req.user._id)) {
      store.create('notifications', {
        recipientId: updated.donorId,
        title: `Donation Status Update: ${status}`,
        message: `Your donation "${donation.title}" is now marked as ${status}.`,
        eventType: 'STATUS_CHANGE',
        donationId: id,
        link: `/tracking/${id}`,
        read: false,
      });
    }

    res.json({
      success: true,
      message: `Donation status updated to ${status}.`,
      donation: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update donation status.', error: err.message });
  }
};

// Explainable Rule-Based Matching Engine
export const getRecommendedMatches = async (req, res) => {
  try {
    const user = store.findById('users', req.user._id);
    const org = user?.organizationId ? store.findById('organizations', user.organizationId) : null;

    const ngoServiceArea = (org?.serviceArea || 'Gandipet / Hyderabad').toLowerCase();

    // Only active available or requested items
    const available = store.getDonations().filter((d) => d.status === 'AVAILABLE' || d.status === 'REQUESTED');
    const now = new Date();

    const matches = available
      .map((d) => {
        const deadline = new Date(d.safeConsumptionDeadline);
        const hoursRemaining = (deadline - now) / (1000 * 60 * 60);

        if (hoursRemaining <= 0) return null; // Expired

        let score = 50; // base score for active listing
        const matchReasons = [];

        // 1. Service Area check
        const donationArea = d.serviceArea.toLowerCase();
        if (
          donationArea.includes(ngoServiceArea) ||
          ngoServiceArea.includes(donationArea) ||
          donationArea.includes('gandipet') ||
          donationArea.includes('hyderabad')
        ) {
          score += 25;
          matchReasons.push(`Located directly within your priority service zone (${d.serviceArea})`);
        } else {
          matchReasons.push(`Accessible within Hyderabad redistribution radius (${d.serviceArea})`);
        }

        // 2. Safe consumption feasibility
        if (hoursRemaining > 3) {
          score += 15;
          matchReasons.push(`Generous pickup window (${hoursRemaining.toFixed(1)} hours before deadline)`);
        } else if (hoursRemaining > 1) {
          score += 10;
          matchReasons.push(`Urgent pickup opportunity (${hoursRemaining.toFixed(1)} hours remaining)`);
        }

        // 3. Category / Dietary suitability
        if (d.isVegetarian) {
          score += 10;
          matchReasons.push('100% Vegetarian — universal recipient acceptability');
        } else {
          matchReasons.push('High protein meal batch');
        }

        // 4. Quantity feasibility
        if (d.quantity >= 20) {
          score += 5;
          matchReasons.push(`High impact yield: feeds ~${d.quantity} people in one collection`);
        }

        const donorOrg = store.findById('organizations', d.organizationId);

        return {
          donation: {
            ...d,
            organization: donorOrg,
          },
          score: Math.min(score, 99),
          hoursRemaining: Math.max(0, hoursRemaining.toFixed(1)),
          matchReasons,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to evaluate donation matches.', error: err.message });
  }
};
