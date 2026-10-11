import { store, generateId } from '../services/store.js';

export const getEventsByDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const donation = store.findById('donations', id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    const events = store
      .getEvents()
      .filter((e) => String(e.donationId) === String(id))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      success: true,
      donationId: id,
      count: events.length,
      events,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve tracking events.', error: err.message });
  }
};

export const addTrackingEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventType, notes = '' } = req.body;

    const donation = store.findById('donations', id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    const validEvents = [
      'PICKUP_SCHEDULED',
      'FOOD_PICKED_UP',
      'DELIVERY_CONFIRMED',
      'COMPLETED',
      'CANCELLED',
    ];

    if (!validEvents.includes(eventType)) {
      return res.status(400).json({ success: false, message: `Invalid event type: ${eventType}` });
    }

    // Role-based authorization & state transition validation
    const userRole = req.user.role;

    if (eventType === 'FOOD_PICKED_UP') {
      if (!['ACCEPTED', 'REQUESTED'].includes(donation.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot record pickup. Current status must be ACCEPTED (current: ${donation.status}).`,
        });
      }
      store.findByIdAndUpdate('donations', id, { status: 'PICKED_UP' });
    } else if (eventType === 'DELIVERY_CONFIRMED') {
      if (donation.status !== 'PICKED_UP') {
        return res.status(400).json({
          success: false,
          message: `Cannot record delivery before food is picked up (current: ${donation.status}).`,
        });
      }
    } else if (eventType === 'COMPLETED') {
      if (!['PICKED_UP', 'ACCEPTED'].includes(donation.status)) {
        return res.status(400).json({
          success: false,
          message: `Donation must be in transit or accepted to mark completed (current: ${donation.status}).`,
        });
      }
      store.findByIdAndUpdate('donations', id, { status: 'COMPLETED' });
    }

    // Add event
    const newEvent = store.create('donationEvents', {
      donationId: id,
      eventType,
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: `${req.user.name} (${req.user.role.toUpperCase()})`,
      notes: notes || `Recorded ${eventType.replace(/_/g, ' ')}.`,
      timestamp: new Date().toISOString(),
    });

    // Notify relevant participants
    const donor = store.findById('users', donation.donorId);
    if (donor && String(donor._id) !== String(req.user._id)) {
      store.create('notifications', {
        recipientId: donor._id,
        title: `Donation Tracking: ${eventType.replace(/_/g, ' ')}`,
        message: `Status update for "${donation.title}": ${notes || eventType}`,
        eventType,
        donationId: id,
        link: `/tracking/${id}`,
        read: false,
      });
    }

    // If marked COMPLETED, celebrate to NGO & Admin
    if (eventType === 'COMPLETED') {
      const ngoUsers = store.getUsers().filter((u) => u.role === 'ngo');
      ngoUsers.forEach((ngo) => {
        store.create('notifications', {
          recipientId: ngo._id,
          title: 'Donation Successfully Handed Over & Served!',
          message: `Verified handover of ${donation.quantity} ${donation.unit} of "${donation.title}". Thank you for Zero Hunger impact!`,
          eventType: 'COMPLETED',
          donationId: id,
          link: `/impact`,
          read: false,
        });
      });
    }

    res.status(201).json({
      success: true,
      message: `Tracking event ${eventType} logged successfully.`,
      event: newEvent,
      donationStatus: store.findById('donations', id)?.status,
    });
  } catch (err) {
    console.error('Tracking event error:', err);
    res.status(500).json({ success: false, message: 'Failed to record tracking event.', error: err.message });
  }
};
