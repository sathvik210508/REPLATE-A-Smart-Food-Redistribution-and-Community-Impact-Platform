import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { isMongoConnected } from '../config/db.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Donation from '../models/Donation.js';
import DonationRequest from '../models/DonationRequest.js';
import DonationEvent from '../models/DonationEvent.js';
import Notification from '../models/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache for ultra-fast queries & JSON persistence
let memStore = {
  users: [],
  organizations: [],
  donations: [],
  donationRequests: [],
  donationEvents: [],
  notifications: [],
};

const saveToFile = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Store] Error persisting to db.json:', err.message);
  }
};

const loadFromFile = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      memStore = { ...memStore, ...data };
      console.log(`[Store] Loaded persistent data: ${memStore.donations?.length || 0} donations, ${memStore.users?.length || 0} users.`);
      return true;
    }
  } catch (err) {
    console.warn('[Store] Could not read db.json, will use initial seed if needed:', err.message);
  }
  return false;
};

// Generate realistic mongo-like ObjectId string
export const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return (timestamp + random).substring(0, 24);
};

export const store = {
  async init() {
    const hasData = loadFromFile();
    if (!hasData || memStore.users.length === 0) {
      await this.seedDefaults();
    }
  },

  async seedDefaults() {
    console.log('[Store] Seeding realistic demonstration records for IETE IDEATHON 2026...');

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('password123', salt);

    const org1Id = '6601a0000000000000000001';
    const org2Id = '6601a0000000000000000002';
    const org3Id = '6601a0000000000000000003';
    const org4Id = '6601a0000000000000000004';
    const org5Id = '6601a0000000000000000005';

    const orgs = [
      {
        _id: org1Id,
        name: 'CBIT Central Canteen & Mess',
        type: 'College Canteen',
        contactPerson: 'Chef Ramesh Kumar',
        email: 'canteen@cbit.ac.in',
        phone: '+91 98490 12345',
        serviceArea: 'Gandipet / CBIT',
        address: 'Chaitanya Bharathi Institute of Technology, Gandipet, Hyderabad, 500075',
        coordinates: { lat: 17.3916, lng: 78.3194 },
        verificationStatus: 'verified',
        capacityDescription: 'Prepares 1,500 meals daily for students and staff.',
        dietaryPreferences: ['Vegetarian', 'Non-Vegetarian'],
        createdAt: new Date('2026-03-01T08:00:00Z').toISOString(),
      },
      {
        _id: org2Id,
        name: 'Minerva Grand Banquet & Restaurant',
        type: 'Restaurant',
        contactPerson: 'Sunil Rao',
        email: 'banquets@minervagrand.com',
        phone: '+91 98490 54321',
        serviceArea: 'Banjara Hills / Jubilee Hills',
        address: 'Road No. 12, Banjara Hills, Hyderabad, 500034',
        coordinates: { lat: 17.4156, lng: 78.4354 },
        verificationStatus: 'verified',
        capacityDescription: 'Specializes in Indian & South Indian prepared banquet buffets.',
        dietaryPreferences: ['Vegetarian'],
        createdAt: new Date('2026-03-05T09:00:00Z').toISOString(),
      },
      {
        _id: org3Id,
        name: 'Akshaya Seva Food Foundation',
        type: 'NGO / Community Kitchen',
        contactPerson: 'Priya Sharma',
        email: 'priya@akshayaseva.org',
        phone: '+91 97000 88214',
        serviceArea: 'Gandipet / Gachibowli / Narsingi',
        address: 'Plot 44, Near Puppalguda Lake, Gandipet Road, Hyderabad, 500089',
        coordinates: { lat: 17.3980, lng: 78.3450 },
        verificationStatus: 'verified',
        capacityDescription: 'Feeds 400 underprivileged children & daily wage workers daily.',
        dietaryPreferences: ['Vegetarian', 'Nutritious Meals'],
        createdAt: new Date('2026-03-02T10:00:00Z').toISOString(),
      },
      {
        _id: org4Id,
        name: 'Robin Hood Army — Hyderabad Chapter',
        type: 'NGO / Community Kitchen',
        contactPerson: 'Vikram Reddy',
        email: 'rha.hyderabad@robinhoodarmy.com',
        phone: '+91 96180 33455',
        serviceArea: 'Hitec City / Madhapur / Kondapur',
        address: 'Sector 2, Hitec City, Hyderabad, 500081',
        coordinates: { lat: 17.4483, lng: 78.3748 },
        verificationStatus: 'verified',
        capacityDescription: 'Volunteer-driven network serving shelters and transit camps.',
        dietaryPreferences: ['All Edible Food'],
        createdAt: new Date('2026-03-03T11:00:00Z').toISOString(),
      },
      {
        _id: org5Id,
        name: 'NovaNex Swift Logistics Network',
        type: 'Logistics Partner',
        contactPerson: 'Arjun Varma',
        email: 'logistics@novanex.org',
        phone: '+91 99887 76655',
        serviceArea: 'All Hyderabad Zones',
        address: 'CBIT Innovation Hub, Gandipet, Hyderabad, 500075',
        coordinates: { lat: 17.3916, lng: 78.3194 },
        verificationStatus: 'verified',
        capacityDescription: 'Insulated food transportation with zero-delay dispatch.',
        dietaryPreferences: [],
        createdAt: new Date('2026-03-01T08:00:00Z').toISOString(),
      },
    ];

    const donorUserId = '6601b0000000000000000001';
    const ngoUserId = '6601b0000000000000000002';
    const volunteerUserId = '6601b0000000000000000003';
    const adminUserId = '6601b0000000000000000004';

    const users = [
      {
        _id: donorUserId,
        name: 'Chef Ramesh Kumar',
        email: 'donor@replate.org',
        passwordHash: defaultPasswordHash,
        role: 'donor',
        organizationId: org1Id,
        phone: '+91 98490 12345',
        status: 'active',
        createdAt: new Date('2026-03-01T08:00:00Z').toISOString(),
      },
      {
        _id: ngoUserId,
        name: 'Priya Sharma',
        email: 'ngo@replate.org',
        passwordHash: defaultPasswordHash,
        role: 'ngo',
        organizationId: org3Id,
        phone: '+91 97000 88214',
        status: 'active',
        createdAt: new Date('2026-03-02T09:00:00Z').toISOString(),
      },
      {
        _id: volunteerUserId,
        name: 'Arjun Varma',
        email: 'volunteer@replate.org',
        passwordHash: defaultPasswordHash,
        role: 'volunteer',
        organizationId: org5Id,
        phone: '+91 99887 76655',
        status: 'active',
        createdAt: new Date('2026-03-01T10:00:00Z').toISOString(),
      },
      {
        _id: adminUserId,
        name: 'Dr. K. Srinivas (CBIT Ideathon Admin)',
        email: 'admin@replate.org',
        passwordHash: defaultPasswordHash,
        role: 'admin',
        organizationId: null,
        phone: '+91 94400 11223',
        status: 'active',
        createdAt: new Date('2026-02-28T12:00:00Z').toISOString(),
      },
    ];

    const now = new Date();
    const inHours = (h) => new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();
    const agoHours = (h) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

    const don1Id = '6601c0000000000000000001';
    const don2Id = '6601c0000000000000000002';
    const don3Id = '6601c0000000000000000003';
    const don4Id = '6601c0000000000000000004';
    const don5Id = '6601c0000000000000000005';
    const don6Id = '6601c0000000000000000006';

    const donations = [
      {
        _id: don1Id,
        donorId: donorUserId,
        organizationId: org1Id,
        title: 'Fresh Vegetable Biryani & Mixed Veg Kurma',
        category: 'Prepared Meals',
        description: 'Steam-cooked aromatic basmati rice with farm vegetables, mint, and mild spices. Packed in food-grade thermal containers immediately following college lunch service.',
        quantity: 45,
        unit: 'servings',
        isVegetarian: true,
        preparationTime: agoHours(2),
        safeConsumptionDeadline: inHours(5),
        storageRequirements: 'Store above 60°C or consume within 4 hours',
        allergenInfo: 'Contains dairy (ghee), nuts (cashew garnish)',
        pickupLocation: 'CBIT Campus Canteen Main Gate, Gandipet',
        serviceArea: 'Gandipet / CBIT',
        pickupWindow: {
          start: agoHours(1),
          end: inHours(3),
        },
        contactPerson: 'Chef Ramesh Kumar',
        contactPhone: '+91 98490 12345',
        minAcceptQuantity: 15,
        recipientNotes: 'Please bring clean insulated transport buckets if possible.',
        status: 'REQUESTED',
        assignedRecipientId: null,
        assignedVolunteerId: null,
        matchedNgoCount: 2,
        requestCount: 1,
        createdAt: agoHours(2),
        updatedAt: agoHours(1),
      },
      {
        _id: don2Id,
        donorId: donorUserId,
        organizationId: org1Id,
        title: 'Packaged Whole Wheat Buns & Fruit Breads',
        category: 'Bakery & Bread',
        description: 'Freshly baked wholesome wheat buns and sweet fruit breads from the college bakery unit, neatly wrapped in batches of 5.',
        quantity: 30,
        unit: 'packed meals',
        isVegetarian: true,
        preparationTime: agoHours(4),
        safeConsumptionDeadline: inHours(24),
        storageRequirements: 'Keep in dry, cool ambient temperature',
        allergenInfo: 'Gluten (wheat)',
        pickupLocation: 'CBIT Bakery Section, Student Activity Center',
        serviceArea: 'Gandipet / CBIT',
        pickupWindow: {
          start: now.toISOString(),
          end: inHours(8),
        },
        contactPerson: 'Chef Ramesh Kumar',
        contactPhone: '+91 98490 12345',
        minAcceptQuantity: 10,
        recipientNotes: 'Long shelf life (24 hours). Easy distribution for evening snack drives.',
        status: 'AVAILABLE',
        assignedRecipientId: null,
        assignedVolunteerId: null,
        matchedNgoCount: 2,
        requestCount: 0,
        createdAt: agoHours(3),
        updatedAt: agoHours(3),
      },
      {
        _id: don3Id,
        donorId: donorUserId,
        organizationId: org1Id,
        title: 'Fresh Apple & Banana Fruit Crates',
        category: 'Fresh Produce & Fruits',
        description: 'High-grade fresh washed apples and ripe bananas sorted from breakfast inventory, stored in ventilated crates.',
        quantity: 25,
        unit: 'kg',
        isVegetarian: true,
        preparationTime: agoHours(6),
        safeConsumptionDeadline: inHours(48),
        storageRequirements: 'Cool ambient dry storage',
        allergenInfo: 'None',
        pickupLocation: 'CBIT Mess Loading Dock #2, Gandipet',
        serviceArea: 'Gandipet / CBIT',
        pickupWindow: {
          start: now.toISOString(),
          end: inHours(12),
        },
        contactPerson: 'Chef Ramesh Kumar',
        contactPhone: '+91 98490 12345',
        minAcceptQuantity: 5,
        recipientNotes: 'Excellent for children nutrition programs.',
        status: 'ACCEPTED',
        assignedRecipientId: org3Id,
        assignedVolunteerId: volunteerUserId,
        matchedNgoCount: 3,
        requestCount: 1,
        createdAt: agoHours(5),
        updatedAt: agoHours(1),
      },
      {
        _id: don4Id,
        donorId: donorUserId,
        organizationId: org2Id,
        title: 'Paneer Butter Masala & Tandoori Roti Buffets',
        category: 'Prepared Meals',
        description: 'Untouched high quality buffet surplus from lunch banquet event. Kept in chafing dishes at proper holding temperatures.',
        quantity: 50,
        unit: 'servings',
        isVegetarian: true,
        preparationTime: agoHours(3),
        safeConsumptionDeadline: inHours(4),
        storageRequirements: 'Keep covered and warm',
        allergenInfo: 'Dairy, Wheat, Cashew paste',
        pickupLocation: 'Minerva Grand Service Entrance, Road No 12, Banjara Hills',
        serviceArea: 'Banjara Hills / Jubilee Hills',
        pickupWindow: {
          start: agoHours(1),
          end: inHours(2),
        },
        contactPerson: 'Sunil Rao',
        contactPhone: '+91 98490 54321',
        minAcceptQuantity: 20,
        recipientNotes: 'Urgent pickup needed due to evening event setup.',
        status: 'PICKED_UP',
        assignedRecipientId: org3Id,
        assignedVolunteerId: volunteerUserId,
        matchedNgoCount: 2,
        requestCount: 1,
        createdAt: agoHours(4),
        updatedAt: agoHours(1),
      },
      {
        _id: don5Id,
        donorId: donorUserId,
        organizationId: org1Id,
        title: 'Dal Tadka, Steamed Rice & Green Salad Boxes',
        category: 'Prepared Meals',
        description: 'Nutritious wholesome lunch batch prepared cleanly. Fully packed into individual food-grade meal boxes with foil covers.',
        quantity: 65,
        unit: 'servings',
        isVegetarian: true,
        preparationTime: agoHours(28),
        safeConsumptionDeadline: agoHours(22),
        storageRequirements: 'Refrigerated or warm',
        allergenInfo: 'None',
        pickupLocation: 'CBIT Gandipet Main Gate',
        serviceArea: 'Gandipet / CBIT',
        pickupWindow: {
          start: agoHours(27),
          end: agoHours(24),
        },
        contactPerson: 'Chef Ramesh Kumar',
        contactPhone: '+91 98490 12345',
        minAcceptQuantity: 20,
        recipientNotes: 'Successfully distributed to Gandipet community shelter.',
        status: 'COMPLETED',
        assignedRecipientId: org3Id,
        assignedVolunteerId: volunteerUserId,
        matchedNgoCount: 2,
        requestCount: 1,
        createdAt: agoHours(28),
        updatedAt: agoHours(23),
      },
      {
        _id: don6Id,
        donorId: donorUserId,
        organizationId: org2Id,
        title: 'South Indian Sambar Rice & Curd Rice Combos',
        category: 'Prepared Meals',
        description: 'Clean excess buffet food from yesterday afternoon conference. Safely collected and delivered to local old age home.',
        quantity: 80,
        unit: 'servings',
        isVegetarian: true,
        preparationTime: agoHours(48),
        safeConsumptionDeadline: agoHours(42),
        storageRequirements: 'Chilled',
        allergenInfo: 'Dairy, Mustard seeds',
        pickupLocation: 'Minerva Grand Banquet Kitchen',
        serviceArea: 'Banjara Hills / Jubilee Hills',
        pickupWindow: {
          start: agoHours(47),
          end: agoHours(44),
        },
        contactPerson: 'Sunil Rao',
        contactPhone: '+91 98490 54321',
        minAcceptQuantity: 25,
        recipientNotes: 'Verified handover with digital signoff.',
        status: 'COMPLETED',
        assignedRecipientId: org4Id,
        assignedVolunteerId: volunteerUserId,
        matchedNgoCount: 2,
        requestCount: 1,
        createdAt: agoHours(48),
        updatedAt: agoHours(43),
      },
    ];

    const req1Id = '6601d0000000000000000001';
    const req3Id = '6601d0000000000000000003';
    const req4Id = '6601d0000000000000000004';
    const req5Id = '6601d0000000000000000005';
    const req6Id = '6601d0000000000000000006';

    const donationRequests = [
      {
        _id: req1Id,
        donationId: don1Id,
        ngoId: org3Id,
        requestedByUserId: ngoUserId,
        status: 'PENDING',
        notes: 'We have 40 children waiting for dinner at our Gandipet shelter center. Can pick up within 45 minutes.',
        estimatedBeneficiaries: 40,
        requestTimestamp: agoHours(1),
        decisionTimestamp: null,
        decisionNotes: '',
        pickupPreference: 'Our volunteer can collect at 4:30 PM',
      },
      {
        _id: req3Id,
        donationId: don3Id,
        ngoId: org3Id,
        requestedByUserId: ngoUserId,
        status: 'ACCEPTED',
        notes: 'Ideal for our daily fruit nutrition drive for elementary children.',
        estimatedBeneficiaries: 50,
        requestTimestamp: agoHours(3),
        decisionTimestamp: agoHours(2),
        decisionNotes: 'Request accepted. Pickup scheduled with NovaNex volunteer.',
        pickupPreference: 'Van pickup arranged',
      },
      {
        _id: req4Id,
        donationId: don4Id,
        ngoId: org3Id,
        requestedByUserId: ngoUserId,
        status: 'ACCEPTED',
        notes: 'Immediate distribution planned for evening shelter.',
        estimatedBeneficiaries: 50,
        requestTimestamp: agoHours(3),
        decisionTimestamp: agoHours(2),
        decisionNotes: 'Food picked up and currently en route.',
        pickupPreference: 'NovaNex volunteer dispatched',
      },
      {
        _id: req5Id,
        donationId: don5Id,
        ngoId: org3Id,
        requestedByUserId: ngoUserId,
        status: 'ACCEPTED',
        notes: 'Regular lunch redistribution.',
        estimatedBeneficiaries: 65,
        requestTimestamp: agoHours(27),
        decisionTimestamp: agoHours(26),
        decisionNotes: 'Handover complete and verified.',
        pickupPreference: 'Direct collection',
      },
      {
        _id: req6Id,
        donationId: don6Id,
        ngoId: org4Id,
        requestedByUserId: ngoUserId,
        status: 'ACCEPTED',
        notes: 'Distributed to evening shelter.',
        estimatedBeneficiaries: 80,
        requestTimestamp: agoHours(46),
        decisionTimestamp: agoHours(45),
        decisionNotes: 'Completed successfully.',
        pickupPreference: 'Van dispatch',
      },
    ];

    const donationEvents = [
      // Events for don1
      {
        _id: generateId(),
        donationId: don1Id,
        eventType: 'CREATED',
        actorId: donorUserId,
        actorName: 'Chef Ramesh Kumar',
        actorRole: 'Food Donor (CBIT Canteen)',
        notes: 'Listed 45 servings of fresh Vegetable Biryani & Kurma.',
        timestamp: agoHours(2),
      },
      {
        _id: generateId(),
        donationId: don1Id,
        eventType: 'REQUEST_SUBMITTED',
        actorId: ngoUserId,
        actorName: 'Priya Sharma',
        actorRole: 'NGO (Akshaya Seva)',
        notes: 'Submitted request for 40 beneficiaries. Pickup offered in 45 mins.',
        timestamp: agoHours(1),
      },

      // Events for don3
      {
        _id: generateId(),
        donationId: don3Id,
        eventType: 'CREATED',
        actorId: donorUserId,
        actorName: 'Chef Ramesh Kumar',
        actorRole: 'Food Donor',
        notes: 'Listed 25 kg of fresh fruit crates.',
        timestamp: agoHours(5),
      },
      {
        _id: generateId(),
        donationId: don3Id,
        eventType: 'REQUEST_SUBMITTED',
        actorId: ngoUserId,
        actorName: 'Priya Sharma',
        actorRole: 'NGO',
        notes: 'Requested for children nutrition program.',
        timestamp: agoHours(3),
      },
      {
        _id: generateId(),
        donationId: don3Id,
        eventType: 'REQUEST_ACCEPTED',
        actorId: donorUserId,
        actorName: 'Chef Ramesh Kumar',
        actorRole: 'Food Donor',
        notes: 'Accepted Akshaya Seva request. Reserved.',
        timestamp: agoHours(2),
      },
      {
        _id: generateId(),
        donationId: don3Id,
        eventType: 'PICKUP_SCHEDULED',
        actorId: volunteerUserId,
        actorName: 'Arjun Varma',
        actorRole: 'Logistics Partner',
        notes: 'Assigned to NovaNex Swift Logistics for collection at 5:00 PM.',
        timestamp: agoHours(1),
      },

      // Events for don4
      {
        _id: generateId(),
        donationId: don4Id,
        eventType: 'CREATED',
        actorId: donorUserId,
        actorName: 'Sunil Rao',
        actorRole: 'Food Donor (Minerva Grand)',
        notes: 'Listed 50 servings buffet surplus.',
        timestamp: agoHours(4),
      },
      {
        _id: generateId(),
        donationId: don4Id,
        eventType: 'REQUEST_SUBMITTED',
        actorId: ngoUserId,
        actorName: 'Priya Sharma',
        actorRole: 'NGO',
        notes: 'Request submitted.',
        timestamp: agoHours(3),
      },
      {
        _id: generateId(),
        donationId: don4Id,
        eventType: 'REQUEST_ACCEPTED',
        actorId: donorUserId,
        actorName: 'Sunil Rao',
        actorRole: 'Food Donor',
        notes: 'Request accepted.',
        timestamp: agoHours(2),
      },
      {
        _id: generateId(),
        donationId: don4Id,
        eventType: 'FOOD_PICKED_UP',
        actorId: volunteerUserId,
        actorName: 'Arjun Varma',
        actorRole: 'Volunteer / Logistics',
        notes: 'Collected 50 servings in insulated bags. In transit to Akshaya Seva shelter.',
        timestamp: agoHours(1),
      },

      // Events for don5 (Completed)
      {
        _id: generateId(),
        donationId: don5Id,
        eventType: 'CREATED',
        actorId: donorUserId,
        actorName: 'Chef Ramesh Kumar',
        actorRole: 'Food Donor',
        notes: 'Listed 65 meal boxes.',
        timestamp: agoHours(28),
      },
      {
        _id: generateId(),
        donationId: don5Id,
        eventType: 'REQUEST_ACCEPTED',
        actorId: donorUserId,
        actorName: 'Chef Ramesh Kumar',
        actorRole: 'Food Donor',
        notes: 'Accepted.',
        timestamp: agoHours(26),
      },
      {
        _id: generateId(),
        donationId: don5Id,
        eventType: 'FOOD_PICKED_UP',
        actorId: volunteerUserId,
        actorName: 'Arjun Varma',
        actorRole: 'Volunteer',
        notes: 'Picked up from Gandipet.',
        timestamp: agoHours(25),
      },
      {
        _id: generateId(),
        donationId: don5Id,
        eventType: 'DELIVERY_CONFIRMED',
        actorId: volunteerUserId,
        actorName: 'Arjun Varma',
        actorRole: 'Volunteer',
        notes: 'Delivered to shelter center.',
        timestamp: agoHours(24),
      },
      {
        _id: generateId(),
        donationId: don5Id,
        eventType: 'COMPLETED',
        actorId: ngoUserId,
        actorName: 'Priya Sharma',
        actorRole: 'NGO (Akshaya Seva)',
        notes: 'All 65 meals verified and served to community. 100% good quality.',
        timestamp: agoHours(23),
      },
    ];

    const notifications = [
      {
        _id: generateId(),
        recipientId: donorUserId,
        title: 'New Donation Request Received',
        message: 'Akshaya Seva Food Foundation requested your "Fresh Vegetable Biryani & Kurma" (45 servings).',
        eventType: 'REQUEST_RECEIVED',
        donationId: don1Id,
        link: `/donor/dashboard`,
        read: false,
        createdAt: agoHours(1),
      },
      {
        _id: generateId(),
        recipientId: ngoUserId,
        title: 'Donation Request Accepted!',
        message: 'Chef Ramesh Kumar accepted your request for "Fresh Apple & Banana Fruit Crates" (25 kg). Pickup is scheduled.',
        eventType: 'REQUEST_ACCEPTED',
        donationId: don3Id,
        link: `/tracking/${don3Id}`,
        read: false,
        createdAt: agoHours(2),
      },
      {
        _id: generateId(),
        recipientId: volunteerUserId,
        title: 'Pickup In Transit',
        message: 'You marked "Paneer Butter Masala Buffets" as picked up. Delivery destination: Akshaya Seva Shelter.',
        eventType: 'PICKUP_UPDATE',
        donationId: don4Id,
        link: `/tracking/${don4Id}`,
        read: true,
        createdAt: agoHours(1),
      },
      {
        _id: generateId(),
        recipientId: adminUserId,
        title: 'Platform Audit: Donation Completed',
        message: 'Donation #6601c5 was verified and marked COMPLETED. 65 meals recorded in SDG 2 impact metric.',
        eventType: 'IMPACT_MILESTONE',
        donationId: don5Id,
        link: `/impact`,
        read: false,
        createdAt: agoHours(23),
      },
    ];

    memStore = {
      users,
      organizations: orgs,
      donations,
      donationRequests,
      donationEvents,
      notifications,
    };

    saveToFile();

    // If MongoDB is connected, also seed Mongoose collections cleanly
    if (isMongoConnected) {
      try {
        await User.deleteMany({});
        await Organization.deleteMany({});
        await Donation.deleteMany({});
        await DonationRequest.deleteMany({});
        await DonationEvent.deleteMany({});
        await Notification.deleteMany({});

        await Organization.insertMany(orgs);
        await User.insertMany(users);
        await Donation.insertMany(donations);
        await DonationRequest.insertMany(donationRequests);
        await DonationEvent.insertMany(donationEvents);
        await Notification.insertMany(notifications);
        console.log('[Store] Seed data successfully synchronized to MongoDB collections.');
      } catch (mongoErr) {
        console.warn('[Store] Notice while syncing to MongoDB:', mongoErr.message);
      }
    }

    console.log('[Store] Seed completed: 5 organizations, 4 role users, 6 donations, full event audit logs.');
  },

  // Collections accessors
  getUsers() { return memStore.users; },
  getOrganizations() { return memStore.organizations; },
  getDonations() { return memStore.donations; },
  getRequests() { return memStore.donationRequests; },
  getEvents() { return memStore.donationEvents; },
  getNotifications() { return memStore.notifications; },

  // Generic helpers
  find(coll) {
    return [...(memStore[coll] || [])];
  },

  findById(coll, id) {
    return (memStore[coll] || []).find((item) => String(item._id) === String(id));
  },

  create(coll, item) {
    const newItem = {
      _id: item._id || generateId(),
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    };
    if (!memStore[coll]) memStore[coll] = [];
    memStore[coll].unshift(newItem);
    saveToFile();
    return newItem;
  },

  findByIdAndUpdate(coll, id, updates) {
    const index = (memStore[coll] || []).findIndex((item) => String(item._id) === String(id));
    if (index === -1) return null;
    memStore[coll][index] = {
      ...memStore[coll][index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToFile();
    return memStore[coll][index];
  },

  deleteOne(coll, id) {
    const prevLen = (memStore[coll] || []).length;
    memStore[coll] = (memStore[coll] || []).filter((item) => String(item._id) !== String(id));
    saveToFile();
    return memStore[coll].length < prevLen;
  },

  // Save manual mutation
  persist() {
    saveToFile();
  }
};
