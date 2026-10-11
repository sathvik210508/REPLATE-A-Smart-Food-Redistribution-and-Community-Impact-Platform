import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const NewDonationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Helper date generators for convenient sensible defaults
  const getDefaultDates = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const toInputString = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const prep = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
    const start = new Date(now.getTime() + 15 * 60 * 1000); // 15 mins from now
    const end = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now
    const deadline = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours from now

    return {
      prep: toInputString(prep),
      start: toInputString(start),
      end: toInputString(end),
      deadline: toInputString(deadline),
    };
  };

  const defaults = getDefaultDates();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Prepared Meals');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('servings');
  const [isVegetarian, setIsVegetarian] = useState(true);
  const [preparationTime, setPreparationTime] = useState(defaults.prep);
  const [safeConsumptionDeadline, setSafeConsumptionDeadline] = useState(defaults.deadline);
  const [storageRequirements, setStorageRequirements] = useState('Store warm above 60°C or consume within 4 hours');
  const [allergenInfo, setAllergenInfo] = useState('Contains dairy (ghee/paneer), no peanuts');

  // Pickup Information
  const [pickupLocation, setPickupLocation] = useState(
    user?.organization?.address || 'CBIT College Canteen Main Loading Gate, Gandipet'
  );
  const [serviceArea, setServiceArea] = useState(
    user?.organization?.serviceArea || 'Gandipet / CBIT'
  );
  const [pickupWindowStart, setPickupWindowStart] = useState(defaults.start);
  const [pickupWindowEnd, setPickupWindowEnd] = useState(defaults.end);
  const [contactPerson, setContactPerson] = useState(user?.name || 'Chef Ramesh Kumar');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 98490 12345');

  // Donation Preferences
  const [minAcceptQuantity, setMinAcceptQuantity] = useState(15);
  const [recipientNotes, setRecipientNotes] = useState(
    'Please bring clean insulated containers or thermal boxes.'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdDonation, setCreatedDonation] = useState(null);

  // Quick preset loader for fast demonstration testing
  const handleApplyPreset = (presetType) => {
    if (presetType === 'biryani') {
      setTitle('Fresh Dum Veg Biryani & Mint Raita');
      setCategory('Prepared Meals');
      setDescription('Fresh aromatic basmati rice cooked with seasonal vegetables and mild spices from campus lunch banquet.');
      setQuantity('40');
      setUnit('servings');
      setIsVegetarian(true);
      setStorageRequirements('Keep warm in thermal containers');
      setAllergenInfo('Contains dairy (ghee)');
    } else if (presetType === 'bakery') {
      setTitle('Assorted High-Fiber Dinner Rolls & Bread Packs');
      setCategory('Bakery & Bread');
      setDescription('Hygienically packaged whole-wheat buns baked this morning at campus bakery.');
      setQuantity('25');
      setUnit('packed meals');
      setIsVegetarian(true);
      setStorageRequirements('Dry ambient storage');
      setAllergenInfo('Wheat gluten');
    } else if (presetType === 'fruits') {
      setTitle('High-Grade Apple & Citrus Fruit Crates');
      setCategory('Fresh Produce & Fruits');
      setDescription('Washed and sorted seasonal fruits packed into ventilated plastic crates.');
      setQuantity('30');
      setUnit('kg');
      setIsVegetarian(true);
      setStorageRequirements('Cool dry storage');
      setAllergenInfo('None');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!title || !description || !quantity || !pickupLocation || !serviceArea) {
      setError('Please fill all mandatory fields: Title, Description, Quantity, Pickup Location, and Service Area.');
      return;
    }

    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      setError('Quantity must be a valid positive number greater than 0.');
      return;
    }

    const deadline = new Date(safeConsumptionDeadline);
    const now = new Date();
    if (deadline <= now) {
      setError('Safe consumption deadline cannot be in the past. Must be a future date/time.');
      return;
    }

    const pStart = new Date(pickupWindowStart);
    const pEnd = new Date(pickupWindowEnd);
    if (pEnd <= pStart) {
      setError('Pickup window end time must be after start time.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        quantity: numQty,
        unit,
        isVegetarian,
        preparationTime: new Date(preparationTime).toISOString(),
        safeConsumptionDeadline: deadline.toISOString(),
        storageRequirements,
        allergenInfo,
        pickupLocation: pickupLocation.trim(),
        serviceArea: serviceArea.trim(),
        pickupWindowStart: pStart.toISOString(),
        pickupWindowEnd: pEnd.toISOString(),
        contactPerson: contactPerson.trim(),
        contactPhone: contactPhone.trim(),
        minAcceptQuantity: Number(minAcceptQuantity) || 1,
        recipientNotes: recipientNotes.trim(),
      };

      const res = await api.createDonation(payload);
      if (res.success && res.donation) {
        setCreatedDonation(res.donation);
      } else {
        throw new Error(res.message || 'Failed to publish listing.');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit donation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Publish Surplus Food"
      subtitle="Create a verified surplus listing to broadcast to nearby registered NGOs and community kitchens."
    >
      {/* Success Modal Confirmation */}
      {createdDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-card max-w-md w-full p-6 border border-replate-border shadow-card text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#EAF6EF] text-[#16845B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-replate-text">
                Surplus Food Published Successfully!
              </h3>
              <p className="text-xs text-replate-subtext mt-1">
                Your listing is now live and broadcast to eligible NGOs in the{' '}
                <strong>{createdDonation.serviceArea}</strong> zone.
              </p>
            </div>

            <div className="p-3 bg-replate-muted rounded-xl text-left text-xs text-replate-text border border-replate-border space-y-1">
              <p className="font-semibold">{createdDonation.title}</p>
              <p className="text-replate-subtext">
                Quantity: {createdDonation.quantity} {createdDonation.unit} ({createdDonation.category})
              </p>
              <p className="text-replate-subtext">
                Pickup deadline:{' '}
                {new Date(createdDonation.safeConsumptionDeadline).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                to={`/tracking/${createdDonation._id}`}
                className="flex-1 py-2.5 px-3 rounded-lg bg-[#16845B] text-white text-xs font-semibold hover:bg-[#116747] transition-colors"
              >
                Track Live Timeline
              </Link>
              <button
                type="button"
                onClick={() => navigate('/donor/dashboard')}
                className="py-2.5 px-4 rounded-lg bg-replate-muted hover:bg-stone-200 text-xs font-semibold text-replate-text"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preset bar for demo speed */}
      <div className="mb-6 p-3 bg-white rounded-card border border-replate-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-replate-text flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#16845B]" />
          Quick Demo Presets:
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleApplyPreset('biryani')}
            className="px-2.5 py-1 rounded-lg border border-replate-border bg-replate-muted hover:bg-emerald-50 text-replate-text font-medium transition-colors"
          >
            40 Servings Veg Biryani
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('bakery')}
            className="px-2.5 py-1 rounded-lg border border-replate-border bg-replate-muted hover:bg-emerald-50 text-replate-text font-medium transition-colors"
          >
            25 Bakery Bread Packs
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('fruits')}
            className="px-2.5 py-1 rounded-lg border border-replate-border bg-replate-muted hover:bg-emerald-50 text-replate-text font-medium transition-colors"
          >
            30 kg Fresh Apples Crates
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form on Left, Live Preview Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section A: Food Information */}
            <div className="bg-white rounded-card border border-replate-border p-5 sm:p-6 shadow-subtle space-y-4">
              <div className="border-b border-replate-border pb-3">
                <span className="text-[11px] font-bold text-[#16845B] uppercase tracking-wider block">
                  Section A
                </span>
                <h3 className="text-base font-bold text-replate-text">Food Information</h3>
                <p className="text-xs text-replate-subtext">
                  Specify details regarding food type, portion sizes, preparation, and safe consumption window.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-replate-text mb-1">
                  Food Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fresh Steamed Vegetable Pulao with Dal"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-replate-border text-xs focus:ring-1 focus:ring-[#16845B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-replate-text mb-1">
                    Food Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-replate-border text-xs bg-white focus:ring-1 focus:ring-[#16845B]"
                  >
                    <option value="Prepared Meals">Prepared Meals</option>
                    <option value="Bakery & Bread">Bakery & Bread</option>
                    <option value="Fresh Produce & Fruits">Fresh Produce & Fruits</option>
                    <option value="Dairy & Refrigerated">Dairy & Refrigerated</option>
                    <option value="Packaged Goods">Packaged Goods</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Other">Other Category</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-replate-text mb-1">
                    Dietary Classification
                  </label>
                  <div className="flex items-center gap-3 h-10">
                    <label className="flex items-center gap-2 text-xs font-medium text-replate-text cursor-pointer">
                      <input
                        type="radio"
                        checked={isVegetarian}
                        onChange={() => setIsVegetarian(true)}
                        className="text-[#16845B] focus:ring-[#16845B]"
                      />
                      100% Vegetarian
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-replate-text cursor-pointer">
                      <input
                        type="radio"
                        checked={!isVegetarian}
                        onChange={() => setIsVegetarian(false)}
                        className="text-[#16845B] focus:ring-[#16845B]"
                      />
                      Non-Vegetarian
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-replate-text mb-1">
                  Food Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe food contents, preparation method, and packaging condition..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-replate-border text-xs focus:ring-1 focus:ring-[#16845B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-replate-text mb-1">
                    Available Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-replate-border text-xs focus:ring-1 focus:ring-[#16845B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-replate-text mb-1">
                    Quantity Unit *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-replate-border text-xs bg-white focus:ring-1 focus:ring-[#16845B]"
                  >
                    <option value="servings">servings (individual portions)</option>
                    <option value="kg">kg (bulk weight)</option>
                    <option value="packed meals">packed meals (sealed meal boxes)</option>
                    <option value="boxes">boxes (crates / batches)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-replate-text mb-1">
                    Preparation Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-replate-text mb-1 text-amber-800">
                    Safe-Consumption Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={safeConsumptionDeadline}
                    onChange={(e) => setSafeConsumptionDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 text-xs bg-amber-50/40 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-amber-700 block mt-1">
                    Strict deadline: listings expire automatically once reached.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-replate-text mb-1">
                    Storage & Handling Requirements
                  </label>
                  <input
                    type="text"
                    value={storageRequirements}
                    onChange={(e) => setStorageRequirements(e.target.value)}
                    placeholder="e.g. Keep warm above 60°C or refrigerated"
                    className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-replate-text mb-1">
                    Allergen Information
                  </label>
                  <input
                    type="text"
                    value={allergenInfo}
                    onChange={(e) => setAllergenInfo(e.target.value)}
                    placeholder="e.g. Contains dairy (paneer), no peanuts"
                    className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section B: Pickup Information */}
            <div className="bg-white rounded-card border border-replate-border p-5 sm:p-6 shadow-subtle space-y-4">
              <div className="border-b border-replate-border pb-3">
                <span className="text-[11px] font-bold text-[#16845B] uppercase tracking-wider block">
                  Section B
                </span>
                <h3 className="text-base font-bold text-replate-text">Pickup & Location Information</h3>
                <p className="text-xs text-replate-subtext">
                  Provide exact collection coordinates and designated contact for logistics personnel.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-replate-text mb-1">
                    Collection / Pickup Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="e.g. CBIT Campus Canteen Main Entrance, Gandipet"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-replate-border text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-replate-text mb-1">
                    City / Service Area Zone *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    placeholder="e.g. Gandipet / CBIT"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-replate-border text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-replate-text mb-1">
                    Pickup Window Start
                  </label>
                  <input
                    type="datetime-local"
                    value={pickupWindowStart}
                    onChange={(e) => setPickupWindowStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-replate-text mb-1">
                    Pickup Window End
                  </label>
                  <input
                    type="datetime-local"
                    value={pickupWindowEnd}
                    onChange={(e) => setPickupWindowEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-replate-text mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-replate-text mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section C: Donation Preferences */}
            <div className="bg-white rounded-card border border-replate-border p-5 sm:p-6 shadow-subtle space-y-4">
              <div className="border-b border-replate-border pb-3">
                <span className="text-[11px] font-bold text-[#16845B] uppercase tracking-wider block">
                  Section C
                </span>
                <h3 className="text-base font-bold text-replate-text">Donation Preferences & Requirements</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-replate-text mb-1">
                    Minimum Quantity a Recipient Can Request
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minAcceptQuantity}
                    onChange={(e) => setMinAcceptQuantity(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-replate-text mb-1">
                    Recipient Instructions & Eligibility Notes
                  </label>
                  <input
                    type="text"
                    value={recipientNotes}
                    onChange={(e) => setRecipientNotes(e.target.value)}
                    placeholder="e.g. Must bring own food-grade containers"
                    className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <Link
                to="/donor/dashboard"
                className="px-4 py-2.5 rounded-lg border border-replate-border text-xs font-semibold text-replate-text hover:bg-replate-muted"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-[#16845B] hover:bg-[#116747] text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Publishing Listing...' : 'Publish Surplus Food Listing'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card on Right */}
        <div className="lg:col-span-4">
          <div className="sticky top-20 bg-white rounded-card border border-replate-border p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-replate-border pb-3">
              <span className="text-xs font-bold text-replate-subtext uppercase tracking-wider">
                Listing Preview
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Available
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-[#16845B] uppercase block">
                {category}
              </span>
              <h4 className="text-sm font-bold text-replate-text mt-0.5">
                {title || 'Surplus Food Batch Title'}
              </h4>
              <p className="text-xs text-replate-subtext mt-1 line-clamp-2">
                {description || 'Detailed food description will appear here...'}
              </p>
            </div>

            <div className="p-3 bg-replate-muted rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-replate-subtext">Portion Quantity:</span>
                <span className="font-bold text-replate-text">
                  {quantity || '—'} {unit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-replate-subtext">Dietary:</span>
                <span className="font-medium text-replate-text">
                  {isVegetarian ? '100% Vegetarian' : 'Non-Vegetarian'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-replate-subtext">Zone:</span>
                <span className="font-medium text-replate-text">{serviceArea}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-replate-subtext">Safe Deadline:</span>
                <span className="font-semibold text-amber-700">
                  {new Date(safeConsumptionDeadline).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-stone-500 space-y-1">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {pickupLocation}
              </p>
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16845B]" />
                Food safety verification required on pickup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
