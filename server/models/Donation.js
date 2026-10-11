import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'Prepared Meals',
        'Bakery & Bread',
        'Fresh Produce & Fruits',
        'Dairy & Refrigerated',
        'Packaged Goods',
        'Beverages',
        'Other',
      ],
      required: true,
    },
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: [1, 'Quantity must be positive'] },
    unit: {
      type: String,
      enum: ['servings', 'kg', 'packed meals', 'boxes'],
      default: 'servings',
      required: true,
    },
    isVegetarian: { type: Boolean, default: true },
    preparationTime: { type: Date, required: true },
    safeConsumptionDeadline: { type: Date, required: true },
    storageRequirements: { type: String, default: 'Keep at ambient temperature' },
    allergenInfo: { type: String, default: 'None specified' },
    pickupLocation: { type: String, required: true },
    serviceArea: { type: String, required: true },
    pickupWindow: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    contactPerson: { type: String, required: true },
    contactPhone: { type: String, required: true },
    minAcceptQuantity: { type: Number, default: 1 },
    recipientNotes: { type: String, default: '' },
    status: {
      type: String,
      enum: [
        'AVAILABLE',
        'REQUESTED',
        'ACCEPTED',
        'PICKED_UP',
        'COMPLETED',
        'REJECTED',
        'CANCELLED',
        'EXPIRED',
      ],
      default: 'AVAILABLE',
      required: true,
    },
    assignedRecipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    assignedVolunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    matchedNgoCount: { type: Number, default: 0 },
    requestCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Donation || mongoose.model('Donation', donationSchema);
