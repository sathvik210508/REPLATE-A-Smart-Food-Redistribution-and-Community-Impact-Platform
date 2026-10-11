import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  MapPin,
  Building2,
  Truck,
  Shield,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Check,
  User,
  HeartHandshake,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const TrackingPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [donation, setDonation] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const loadTrackingData = async () => {
    try {
      setLoading(true);
      const res = await api.getDonationById(id);
      if (res.success && res.donation) {
        setDonation(res.donation);
        setEvents(res.donation.events || []);
      }
    } catch (err) {
      console.error('Failed to load tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrackingData();
  }, [id]);

  const handleAdvanceState = async (eventType, notes) => {
    try {
      setActionLoading(true);
      setFeedback('');
      const res = await api.addTrackingEvent(id, eventType, notes);
      if (res.success) {
        if (eventType === 'COMPLETED') {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }
        setFeedback(`Lifecycle event recorded: ${eventType.replace(/_/g, ' ')}`);
        await loadTrackingData();
      }
    } catch (err) {
      setFeedback(`Action failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const stages = [
    { key: 'CREATED', label: '1. Surplus Food Listed' },
    { key: 'REQUEST_SUBMITTED', label: '2. Recipient Request Submitted' },
    { key: 'REQUEST_ACCEPTED', label: '3. Request Accepted & Reserved' },
    { key: 'PICKUP_SCHEDULED', label: '4. Pickup Scheduled' },
    { key: 'FOOD_PICKED_UP', label: '5. Food Collected & In Transit' },
    { key: 'DELIVERY_CONFIRMED', label: '6. Delivery Arrival at Kitchen' },
    { key: 'COMPLETED', label: '7. Handover Verified & Served' },
  ];

  const getStageStatus = (stageKey) => {
    const hasEvent = events.some((e) => e.eventType === stageKey);
    return hasEvent;
  };

  if (loading) {
    return (
      <DashboardLayout title="Tracking Handover Timeline">
        <div className="py-20 text-center text-xs text-replate-subtext">
          Loading donation lifecycle history...
        </div>
      </DashboardLayout>
    );
  }

  if (!donation) {
    return (
      <DashboardLayout title="Tracking Handover Timeline">
        <div className="py-20 text-center text-xs text-replate-subtext space-y-3">
          <p>Donation listing not found.</p>
          <Link
            to="/donor/dashboard"
            className="text-[#16845B] font-semibold hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Verified Handover Timeline"
      subtitle={`Tracking Reference ID: #${donation._id.substring(0, 8)}`}
    >
      {/* Top Breadcrumb and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-replate-subtext hover:text-replate-text"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </button>

        <div className="flex items-center gap-2">
          <StatusBadge status={donation.status} />
          <span className="text-xs text-stone-400">
            Created {new Date(donation.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {feedback && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Grid: Details Header + Two Column Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Timeline & Interactive Transitions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card: Donation Snapshot */}
          <div className="bg-white rounded-card border border-replate-border p-5 sm:p-6 shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-replate-border pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#16845B] bg-[#EAF6EF] px-2 py-0.5 rounded-full uppercase">
                  {donation.category}
                </span>
                <h2 className="text-lg font-bold text-replate-text mt-1">{donation.title}</h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-400 block uppercase">Quantity</span>
                <span className="text-lg font-bold text-replate-text">
                  {donation.quantity} {donation.unit}
                </span>
              </div>
            </div>

            <p className="text-xs text-replate-subtext leading-relaxed">
              {donation.description}
            </p>

            {/* Quick Actions to Advance Workflow based on active state */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              {donation.status === 'ACCEPTED' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    handleAdvanceState(
                      'FOOD_PICKED_UP',
                      `Pickup confirmed by ${user?.name}. Insulated containers verified.`
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  Confirm Food Picked Up (In Transit)
                </button>
              )}

              {donation.status === 'PICKED_UP' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    handleAdvanceState(
                      'COMPLETED',
                      `Handover complete. Safe receipt verified by ${user?.name} and served.`
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-[#16845B] hover:bg-[#116747] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirm Handover & Complete Donation
                </button>
              )}

              {donation.status === 'COMPLETED' && (
                <div className="inline-flex items-center gap-1.5 text-xs text-[#116747] font-semibold bg-[#EAF6EF] px-3 py-1.5 rounded-lg border border-[#16845B]/30">
                  <Check className="w-4 h-4 text-[#16845B]" />
                  Donation Completed & Logged into SDG 2 Impact Analytics
                </div>
              )}
            </div>
          </div>

          {/* Vertical Timeline Card */}
          <div className="bg-white rounded-card border border-replate-border p-5 sm:p-6 shadow-subtle">
            <h3 className="text-sm font-bold text-replate-text mb-1">
              Step-by-Step Handover Audit History
            </h3>
            <p className="text-xs text-replate-subtext mb-6">
              Immutable timestamped trail of verified physical handover milestones.
            </p>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-replate-border">
              {events.map((evt, idx) => {
                const dateObj = new Date(evt.timestamp);
                return (
                  <div key={evt._id || idx} className="relative group text-xs">
                    {/* Circle Node */}
                    <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#16845B] ring-4 ring-white" />

                    <div className="bg-replate-muted/50 p-4 rounded-xl border border-replate-border hover:border-[#16845B]/40 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                        <span className="font-bold text-sm text-replate-text">
                          {evt.eventType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          {dateObj.toLocaleDateString()} at{' '}
                          {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-semibold text-stone-700 bg-white px-2 py-0.5 rounded border border-replate-border">
                          {evt.actorName}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          ({evt.actorRole})
                        </span>
                      </div>

                      {evt.notes && (
                        <p className="text-replate-subtext text-xs leading-relaxed bg-white p-2.5 rounded-lg border border-replate-border/60">
                          {evt.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Origin & Destination Cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Collection Origin Card */}
          <div className="bg-white rounded-card border border-replate-border p-5 shadow-subtle text-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-replate-border pb-3">
              <Building2 className="w-4 h-4 text-[#16845B]" />
              <h4 className="font-bold text-replate-text">Food Donor Origin</h4>
            </div>

            <div>
              <p className="font-bold text-replate-text">
                {donation.organization?.name || 'CBIT College Canteen'}
              </p>
              <p className="text-stone-500 mt-0.5">{donation.pickupLocation}</p>
              <p className="text-stone-500">Service Area: {donation.serviceArea}</p>
            </div>

            <div className="p-2.5 bg-replate-muted rounded-lg text-stone-600 space-y-1">
              <p>
                <strong>Contact Person:</strong> {donation.contactPerson}
              </p>
              <p>
                <strong>Phone:</strong> {donation.contactPhone}
              </p>
            </div>
          </div>

          {/* Delivery Recipient Card */}
          <div className="bg-white rounded-card border border-replate-border p-5 shadow-subtle text-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-replate-border pb-3">
              <HeartHandshake className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-replate-text">Recipient Destination NGO</h4>
            </div>

            {donation.assignedRecipient ? (
              <>
                <div>
                  <p className="font-bold text-replate-text">
                    {donation.assignedRecipient.name}
                  </p>
                  <p className="text-stone-500 mt-0.5">{donation.assignedRecipient.address}</p>
                  <p className="text-stone-500">
                    Zone: {donation.assignedRecipient.serviceArea}
                  </p>
                </div>

                <div className="p-2.5 bg-blue-50/50 rounded-lg text-stone-600 space-y-1 border border-blue-200/50">
                  <p>
                    <strong>Contact:</strong> {donation.assignedRecipient.contactPerson}
                  </p>
                  <p>
                    <strong>Phone:</strong> {donation.assignedRecipient.phone}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-stone-400 italic">
                Awaiting request approval to assign recipient organization.
              </p>
            )}
          </div>

          {/* Safe Food Handling Card */}
          <div className="bg-white rounded-card border border-replate-border p-5 shadow-subtle text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
              <AlertCircle className="w-4 h-4 text-[#F2A44A]" />
              Safe Consumption Deadline
            </div>
            <p className="text-base font-bold text-amber-700">
              {new Date(donation.safeConsumptionDeadline).toLocaleString()}
            </p>
            <p className="text-stone-500 text-[11px]">
              Storage: {donation.storageRequirements}
            </p>
            <p className="text-stone-500 text-[11px]">
              Allergens: {donation.allergenInfo}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
