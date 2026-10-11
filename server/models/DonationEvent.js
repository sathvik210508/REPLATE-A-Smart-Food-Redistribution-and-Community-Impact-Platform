import mongoose from 'mongoose';

const donationEventSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    eventType: {
      type: String,
      enum: [
        'CREATED',
        'REQUEST_SUBMITTED',
        'REQUEST_ACCEPTED',
        'REQUEST_REJECTED',
        'PICKUP_SCHEDULED',
        'FOOD_PICKED_UP',
        'DELIVERY_CONFIRMED',
        'COMPLETED',
        'CANCELLED',
      ],
      required: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    notes: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.DonationEvent || mongoose.model('DonationEvent', donationEventSchema);
