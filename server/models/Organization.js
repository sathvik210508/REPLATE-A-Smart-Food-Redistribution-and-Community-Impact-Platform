import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        'Restaurant',
        'College Canteen',
        'Event Organizer',
        'NGO / Community Kitchen',
        'Shelter',
        'Logistics Partner',
        'Other',
      ],
      required: true,
    },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    serviceArea: { type: String, required: true, trim: true }, // e.g., 'Gandipet / CBIT', 'Gachibowli', 'Hitec City'
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, default: 17.3916 },
      lng: { type: Number, default: 78.3194 },
    },
    verificationStatus: {
      type: String,
      enum: ['verified', 'pending', 'rejected'],
      default: 'verified',
    },
    capacityDescription: { type: String, default: '' },
    dietaryPreferences: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Organization || mongoose.model('Organization', organizationSchema);
