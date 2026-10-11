import mongoose from 'mongoose';

const donationRequestSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    requestedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      required: true,
    },
    notes: { type: String, default: '' },
    estimatedBeneficiaries: { type: Number, default: 20 },
    requestTimestamp: { type: Date, default: Date.now },
    decisionTimestamp: { type: Date, default: null },
    decisionNotes: { type: String, default: '' },
    pickupPreference: { type: String, default: 'Standard pickup window' },
  },
  { timestamps: true }
);

export default mongoose.models.DonationRequest || mongoose.model('DonationRequest', donationRequestSchema);
