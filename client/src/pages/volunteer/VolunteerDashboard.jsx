import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Check,
  AlertTriangle,
  Eye,
  Phone,
  ShieldCheck,
  PackageCheck,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { KPIStatCard } from '../../components/ui/KPIStatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Issue modal
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [issueNotes, setIssueNotes] = useState('');

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.getDonations();
      if (res.success) {
        // Show assigned or relevant active logistics items
        setDonations(res.donations || []);
      }
    } catch (err) {
      console.error('Failed to load volunteer assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handlePickup = async (donationId) => {
    try {
      setActionLoading(true);
      setFeedback('');
      const res = await api.addTrackingEvent(
        donationId,
        'FOOD_PICKED_UP',
        'Food verified and loaded into insulated carrier crates by volunteer.'
      );
      if (res.success) {
        setFeedback('Pickup confirmed! Food is now marked as in transit.');
        await loadAssignments();
      }
    } catch (err) {
      setFeedback(`Pickup error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteHandover = async (donationId) => {
    try {
      setActionLoading(true);
      setFeedback('');
      const res = await api.addTrackingEvent(
        donationId,
        'COMPLETED',
        'Food safely delivered and handed over to destination NGO community kitchen.'
      );
      if (res.success) {
        // Confetti celebration
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        setFeedback('Donation Handover Verified & Completed! Zero Hunger impact logged.');
        await loadAssignments();
      }
    } catch (err) {
      setFeedback(`Handover error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!selectedDonation) return;

    try {
      setActionLoading(true);
      await api.addTrackingEvent(
        selectedDonation._id,
        'PICKUP_SCHEDULED',
        `Logistics Note: ${issueNotes}`
      );
      setFeedback('Status note logged to the donation audit timeline.');
      setIssueModalOpen(false);
      setIssueNotes('');
      await loadAssignments();
    } catch (err) {
      setFeedback(`Error logging note: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter for items in active logistics pipeline
  const activeDispatches = donations.filter((d) =>
    ['ACCEPTED', 'PICKED_UP'].includes(d.status)
  );
  const completedDispatches = donations.filter((d) => d.status === 'COMPLETED');

  return (
    <DashboardLayout
      title="Volunteer Logistics & Transit Portal"
      subtitle={`Welcome, ${user?.name || 'Arjun Varma'}. Coordinate safe collection and direct delivery.`}
    >
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-card border border-replate-border shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h2 className="text-base font-bold text-replate-text">
              NovaNex Volunteer Logistics Brigade
            </h2>
          </div>
          <p className="text-xs text-replate-subtext mt-0.5">
            Rapid food rescue team · Operating across Gandipet, Gachibowli, & Hyderabad Metro
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAF6EF] text-[#116747] text-xs font-semibold border border-[#16845B]/20">
          <ShieldCheck className="w-4 h-4 text-[#16845B]" />
          Zero Hunger Distribution Active
        </div>
      </div>

      {feedback && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPIStatCard
          title="Active Pickups"
          value={activeDispatches.length}
          subtext="Ready for collection or in transit"
          icon={Truck}
          badgeText="Active"
          badgeColor="orange"
        />
        <KPIStatCard
          title="Scheduled Pickups"
          value={donations.filter((d) => d.status === 'ACCEPTED').length}
          subtext="Accepted by donor"
          icon={Clock}
          badgeText="Ready"
          badgeColor="green"
        />
        <KPIStatCard
          title="In Transit Now"
          value={donations.filter((d) => d.status === 'PICKED_UP').length}
          subtext="En route to recipient"
          icon={PackageCheck}
          badgeText="Live"
          badgeColor="orange"
        />
        <KPIStatCard
          title="Delivered Batches"
          value={completedDispatches.length}
          subtext="Verified handovers complete"
          icon={CheckCircle2}
          badgeText="100%"
          badgeColor="green"
        />
      </div>

      {/* Active Assignments */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-replate-text">Assigned Redirection Deliveries</h3>
          <p className="text-xs text-replate-subtext">
            Ensure proper hygienic transport and record timestamped pickup/handover confirmations.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-replate-subtext">
            Loading logistics assignments...
          </div>
        ) : activeDispatches.length === 0 ? (
          <EmptyState
            title="No pending deliveries in dispatch queue"
            description="All accepted donations have been completed. Check back once new donor requests are approved!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeDispatches.map((d) => {
              const isAccepted = d.status === 'ACCEPTED';
              const isPickedUp = d.status === 'PICKED_UP';

              return (
                <div
                  key={d._id}
                  className="bg-white rounded-card border border-replate-border p-5 shadow-subtle text-xs space-y-4 hover:border-indigo-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                        {d.category}
                      </span>
                      <StatusBadge status={d.status} />
                    </div>

                    <h4 className="text-base font-bold text-replate-text">{d.title}</h4>

                    <div className="p-3 bg-replate-muted rounded-xl space-y-2 text-xs">
                      {/* Donor Origin */}
                      <div>
                        <span className="text-[10px] font-semibold text-stone-400 uppercase block">
                          Step 1: Collection Point (Donor)
                        </span>
                        <p className="font-bold text-replate-text">
                          {d.organization?.name || 'CBIT Canteen'}
                        </p>
                        <p className="text-stone-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          {d.pickupLocation}
                        </p>
                        <p className="text-stone-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                          {d.contactPerson}: {d.contactPhone}
                        </p>
                      </div>

                      <div className="border-t border-replate-border/60 pt-2">
                        <span className="text-[10px] font-semibold text-stone-400 uppercase block">
                          Step 2: Delivery Destination (Recipient NGO)
                        </span>
                        <p className="font-bold text-replate-text">
                          {d.assignedRecipient?.name || 'Akshaya Seva Food Foundation'}
                        </p>
                        <p className="text-stone-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          {d.assignedRecipient?.address || 'Gandipet Road, Hyderabad'}
                        </p>
                      </div>
                    </div>

                    {/* Handling instructions */}
                    <div className="text-[11px] text-stone-600 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60 space-y-1">
                      <p>
                        <strong>Portion:</strong> {d.quantity} {d.unit}
                      </p>
                      <p>
                        <strong>Handling:</strong> {d.storageRequirements}
                      </p>
                      <p>
                        <strong>Safe Deadline:</strong>{' '}
                        {new Date(d.safeConsumptionDeadline).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-replate-border flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/tracking/${d._id}`}
                        className="py-1.5 px-3 rounded-lg border border-replate-border font-medium text-stone-700 hover:bg-replate-muted flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Timeline
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDonation(d);
                          setIssueModalOpen(true);
                        }}
                        className="py-1.5 px-2.5 rounded-lg text-stone-500 hover:text-stone-700 font-medium"
                      >
                        Report Issue
                      </button>
                    </div>

                    {isAccepted && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handlePickup(d._id)}
                        className="py-1.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirm Pickup
                      </button>
                    )}

                    {isPickedUp && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleCompleteHandover(d._id)}
                        className="py-1.5 px-4 rounded-lg bg-[#16845B] hover:bg-[#116747] text-white font-semibold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirm Handover & Complete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Issue Modal */}
      <Modal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        title="Report Logistics or Pickup Note"
        subtitle={`Donation: ${selectedDonation?.title || ''}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleReportIssue} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-replate-text mb-1">
              Logistics Status Update Note *
            </label>
            <textarea
              required
              rows={3}
              value={issueNotes}
              onChange={(e) => setIssueNotes(e.target.value)}
              placeholder="e.g. Traffic near Narsingi junction, estimated arrival delayed by 15 mins."
              className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-replate-border">
            <button
              type="button"
              onClick={() => setIssueModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-replate-muted font-semibold text-stone-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Log Note to Timeline
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
