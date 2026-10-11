import { store, generateId } from '../services/store.js';

export const createRequest = async (req, res) => {
  try {
    const { id: donationId } = req.params;
    const { notes = '', estimatedBeneficiaries = 25, pickupPreference = 'Standard collection' } = req.body;

    const donation = store.findById('donations', donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    if (donation.status === 'EXPIRED') {
      return res.status(400).json({ success: false, message: 'This donation has expired and can no longer be requested.' });
    }

    if (['ACCEPTED', 'PICKED_UP', 'COMPLETED', 'CANCELLED'].includes(donation.status)) {
      return res.status(400).json({
        success: false,
        message: `This donation is no longer available (current status: ${donation.status}).`,
      });
    }

    const ngoOrgId = req.user.organizationId || (store.getOrganizations().find((o) => o.type.includes('NGO'))?._id);

    // Prevent duplicate pending requests from same NGO
    const existingReq = store.getRequests().find(
      (r) => String(r.donationId) === String(donationId) && String(r.ngoId) === String(ngoOrgId) && r.status === 'PENDING'
    );

    if (existingReq) {
      return res.status(400).json({
        success: false,
        message: 'Your organization already has an active pending request for this donation.',
      });
    }

    const newRequest = store.create('donationRequests', {
      donationId,
      ngoId: ngoOrgId,
      requestedByUserId: req.user._id,
      status: 'PENDING',
      notes: notes.trim(),
      estimatedBeneficiaries: Number(estimatedBeneficiaries) || 20,
      pickupPreference,
      requestTimestamp: new Date().toISOString(),
      decisionTimestamp: null,
      decisionNotes: '',
    });

    // Update donation status to REQUESTED if still AVAILABLE
    if (donation.status === 'AVAILABLE') {
      store.findByIdAndUpdate('donations', donationId, {
        status: 'REQUESTED',
        requestCount: (donation.requestCount || 0) + 1,
      });
    } else {
      store.findByIdAndUpdate('donations', donationId, {
        requestCount: (donation.requestCount || 0) + 1,
      });
    }

    // Record audit event
    const ngoOrg = store.findById('organizations', ngoOrgId);
    store.create('donationEvents', {
      donationId,
      eventType: 'REQUEST_SUBMITTED',
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: `NGO (${ngoOrg?.name || 'Partner'})`,
      notes: `Requested donation for ~${newRequest.estimatedBeneficiaries} beneficiaries. Note: "${notes || 'Pickup coordinate requested'}"`,
      timestamp: new Date().toISOString(),
    });

    // Notify donor
    store.create('notifications', {
      recipientId: donation.donorId,
      title: 'New Donation Request Received!',
      message: `${ngoOrg?.name || req.user.name} submitted a request for "${donation.title}". Review and accept to schedule pickup.`,
      eventType: 'NEW_REQUEST',
      donationId,
      link: `/donor/dashboard`,
      read: false,
    });

    res.status(201).json({
      success: true,
      message: 'Donation request submitted successfully.',
      request: newRequest,
    });
  } catch (err) {
    console.error('Request submission error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit donation request.', error: err.message });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const userRole = req.user.role;
    let requests = store.getRequests();

    if (userRole === 'ngo') {
      const ngoOrgId = req.user.organizationId;
      requests = requests.filter(
        (r) => String(r.requestedByUserId) === String(req.user._id) || (ngoOrgId && String(r.ngoId) === String(ngoOrgId))
      );
    } else if (userRole === 'donor') {
      const myDonationIds = store
        .getDonations()
        .filter((d) => String(d.donorId) === String(req.user._id))
        .map((d) => String(d._id));
      requests = requests.filter((r) => myDonationIds.includes(String(r.donationId)));
    }

    const populated = requests.map((r) => {
      const donation = store.findById('donations', r.donationId);
      const donorOrg = donation ? store.findById('organizations', donation.organizationId) : null;
      const ngoOrg = store.findById('organizations', r.ngoId);
      const requester = store.findById('users', r.requestedByUserId);
      return {
        ...r,
        donation: donation ? { ...donation, organization: donorOrg } : null,
        ngo: ngoOrg,
        requester: requester ? { name: requester.name, email: requester.email, phone: requester.phone } : null,
      };
    });

    // Sort by recent requestTimestamp
    populated.sort((a, b) => new Date(b.requestTimestamp) - new Date(a.requestTimestamp));

    res.json({
      success: true,
      count: populated.length,
      requests: populated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve requests.', error: err.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, decisionNotes = '' } = req.body;

    if (!['ACCEPTED', 'REJECTED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be ACCEPTED, REJECTED, or CANCELLED.' });
    }

    const request = store.findById('donationRequests', id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const donation = store.findById('donations', request.donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Associated donation not found.' });
    }

    // Authorization check
    if (req.user.role === 'donor' && String(donation.donorId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to decide on this donation request.' });
    }

    const updatedRequest = store.findByIdAndUpdate('donationRequests', id, {
      status,
      decisionTimestamp: new Date().toISOString(),
      decisionNotes,
    });

    const ngoOrg = store.findById('organizations', request.ngoId);

    if (status === 'ACCEPTED') {
      // Find a volunteer to auto-assign for logistics tracking
      const volunteer = store.getUsers().find((u) => u.role === 'volunteer') || null;

      // Update donation status & assigned recipient
      store.findByIdAndUpdate('donations', donation._id, {
        status: 'ACCEPTED',
        assignedRecipientId: request.ngoId,
        assignedVolunteerId: volunteer?._id || null,
      });

      // Auto-reject any other competing requests
      const otherRequests = store.getRequests().filter(
        (r) => String(r.donationId) === String(donation._id) && String(r._id) !== String(id) && r.status === 'PENDING'
      );

      otherRequests.forEach((other) => {
        store.findByIdAndUpdate('donationRequests', other._id, {
          status: 'REJECTED',
          decisionTimestamp: new Date().toISOString(),
          decisionNotes: 'Another recipient request was accepted for this donation.',
        });
      });

      // Record ACCEPTED event
      store.create('donationEvents', {
        donationId: donation._id,
        eventType: 'REQUEST_ACCEPTED',
        actorId: req.user._id,
        actorName: req.user.name,
        actorRole: `Food Donor`,
        notes: `Accepted request from ${ngoOrg?.name || 'NGO'}. Food is reserved for pickup.`,
        timestamp: new Date().toISOString(),
      });

      // Record PICKUP_SCHEDULED event
      store.create('donationEvents', {
        donationId: donation._id,
        eventType: 'PICKUP_SCHEDULED',
        actorId: req.user._id,
        actorName: 'REPLATE Coordination Engine',
        actorRole: 'System Logistics Coordinator',
        notes: `Pickup window: ${new Date(donation.pickupWindow.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${new Date(donation.pickupWindow.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Assigned volunteer: ${volunteer?.name || 'NovaNex Volunteer Brigade'}.`,
        timestamp: new Date().toISOString(),
      });

      // Notify NGO requester
      store.create('notifications', {
        recipientId: request.requestedByUserId,
        title: 'Donation Request Accepted!',
        message: `Your request for "${donation.title}" has been ACCEPTED! Pickup coordination is active.`,
        eventType: 'REQUEST_ACCEPTED',
        donationId: donation._id,
        link: `/tracking/${donation._id}`,
        read: false,
      });

      // Notify volunteer if assigned
      if (volunteer) {
        store.create('notifications', {
          recipientId: volunteer._id,
          title: 'New Logistics Assignment',
          message: `Pickup scheduled for "${donation.title}" at ${donation.pickupLocation}.`,
          eventType: 'PICKUP_ASSIGNED',
          donationId: donation._id,
          link: `/volunteer/dashboard`,
          read: false,
        });
      }
    } else if (status === 'REJECTED') {
      // Check if there are other pending requests
      const remainingPending = store.getRequests().some(
        (r) => String(r.donationId) === String(donation._id) && String(r._id) !== String(id) && r.status === 'PENDING'
      );

      if (!remainingPending && donation.status === 'REQUESTED') {
        store.findByIdAndUpdate('donations', donation._id, { status: 'AVAILABLE' });
      }

      store.create('donationEvents', {
        donationId: donation._id,
        eventType: 'REQUEST_REJECTED',
        actorId: req.user._id,
        actorName: req.user.name,
        actorRole: 'Food Donor',
        notes: `Declined request: ${decisionNotes || 'Capacity reached or alternate pickup constraint'}`,
        timestamp: new Date().toISOString(),
      });

      store.create('notifications', {
        recipientId: request.requestedByUserId,
        title: 'Donation Request Update',
        message: `Your request for "${donation.title}" could not be accommodated at this time.`,
        eventType: 'REQUEST_REJECTED',
        donationId: donation._id,
        link: `/ngo/dashboard`,
        read: false,
      });
    }

    res.json({
      success: true,
      message: `Request status updated to ${status}.`,
      request: updatedRequest,
    });
  } catch (err) {
    console.error('Update request error:', err);
    res.status(500).json({ success: false, message: 'Failed to update request status.', error: err.message });
  }
};
