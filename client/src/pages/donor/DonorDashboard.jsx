import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Clock,
  CheckCircle,
  PackageCheck,
  AlertCircle,
  Eye,
  ExternalLink,
  Search,
  Filter,
  Check,
  X,
  Users,
  Utensils,
  MapPin,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { KPIStatCard } from '../../components/ui/KPIStatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const DonorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected donation for viewing details or managing requests
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [donationsRes, kpiRes] = await Promise.all([
        api.getDonations({ donorId: user?._id }),
        api.getDonorAnalytics(),
      ]);
      if (donationsRes.success) setDonations(donationsRes.donations || []);
      if (kpiRes.success) setKpis(kpiRes.kpis);
    } catch (err) {
      console.error('Failed to load donor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      loadData();
    }
  }, [user?._id]);

  const handleOpenRequests = async (donationId) => {
    try {
      const res = await api.getDonationById(donationId);
      if (res.success) {
        setSelectedDonation(res.donation);
        setRequestModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load donation details:', err);
    }
  };

  const handleRequestDecision = async (requestId, decision) => {
    try {
      setActionLoading(true);
      const res = await api.updateRequestStatus(requestId, decision, `Decision marked by ${user?.name}`);
      if (res.success) {
        setFeedbackMsg(`Request successfully ${decision === 'ACCEPTED' ? 'accepted and reserved' : 'declined'}.`);
        await loadData();
        if (selectedDonation) {
          const updated = await api.getDonationById(selectedDonation._id);
          setSelectedDonation(updated.donation);
        }
      }
    } catch (err) {
      setFeedbackMsg(`Action error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered donations list
  const filteredDonations = donations.filter((d) => {
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getHoursUntilDeadline = (deadlineIso) => {
    const diff = (new Date(deadlineIso) - new Date()) / (1000 * 60 * 60);
    return diff;
  };

  return (
    <DashboardLayout
      title="Surplus Food Portal"
      subtitle={`Welcome back, ${user?.name || 'Chef Ramesh'}. Track and manage surplus food redistribution.`}
    >
      {/* Top Banner & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-card border border-replate-border shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-base font-bold text-replate-text">
              {user?.organization?.name || 'CBIT College Canteen & Mess'}
            </h2>
          </div>
          <p className="text-xs text-replate-subtext mt-0.5">
            Zone: {user?.organization?.serviceArea || 'Gandipet / Hyderabad'} · Verified Surplus Donor
          </p>
        </div>

        <Link
          to="/donor/donations/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#16845B] hover:bg-[#116747] text-white text-xs font-semibold transition-all shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          + Post Surplus Food
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPIStatCard
          title="Active Donations"
          value={kpis?.activeDonations ?? (donations.filter((d) => ['AVAILABLE', 'REQUESTED', 'ACCEPTED', 'PICKED_UP'].includes(d.status)).length)}
          subtext="Currently open or scheduled"
          icon={Utensils}
          badgeText="Live"
          badgeColor="green"
        />
        <KPIStatCard
          title="Pending Requests"
          value={kpis?.pendingRequests ?? (donations.filter((d) => d.status === 'REQUESTED').length)}
          subtext="Awaiting your approval"
          icon={AlertCircle}
          badgeText={kpis?.pendingRequests > 0 ? 'Action needed' : 'Clear'}
          badgeColor={kpis?.pendingRequests > 0 ? 'orange' : 'green'}
        />
        <KPIStatCard
          title="Completed Donations"
          value={kpis?.completedDonations ?? (donations.filter((d) => d.status === 'COMPLETED').length)}
          subtext="Verified community handovers"
          icon={CheckCircle}
          badgeText="Verified"
          badgeColor="green"
        />
        <KPIStatCard
          title="Redistributed Meals"
          value={kpis?.totalFoodRedistributedServings ? `${kpis.totalFoodRedistributedServings}` : '145'}
          subtext="Total servings provided"
          icon={PackageCheck}
          badgeText="SDG 2"
          badgeColor="green"
        />
      </div>

      {/* Donations Table Header & Filters */}
      <div className="bg-white rounded-card border border-replate-border shadow-subtle overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-replate-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-replate-text">Recent Food Listings</h3>
            <p className="text-xs text-replate-subtext">
              Real-time statuses, recipient requests, and audit logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-replate-subtext absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-replate-border text-xs focus:ring-1 focus:ring-[#16845B] focus:outline-none w-48"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-replate-border text-xs bg-white text-replate-text focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="REQUESTED">Requested</option>
              <option value="ACCEPTED">Accepted / Reserved</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="COMPLETED">Completed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-xs text-replate-subtext">
              Loading donation records...
            </div>
          ) : filteredDonations.length === 0 ? (
            <EmptyState
              title="No food listings found"
              description="No donations currently match your selected filters. Post a surplus batch to get started!"
              actionText="+ Post Surplus Food"
              onAction={() => navigate('/donor/donations/new')}
            />
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-replate-border bg-replate-muted/50 text-replate-subtext font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Food Item</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Pickup Deadline</th>
                  <th className="py-3 px-4">Requests</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-replate-border/70 text-replate-text">
                {filteredDonations.map((d) => {
                  const hoursLeft = getHoursUntilDeadline(d.safeConsumptionDeadline);
                  const isUrgent = hoursLeft > 0 && hoursLeft < 3;
                  const isExpired = hoursLeft <= 0;

                  return (
                    <tr key={d._id} className="hover:bg-replate-muted/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-replate-text">{d.title}</div>
                        <div className="text-[11px] text-replate-subtext flex items-center gap-2 mt-0.5">
                          <span>{d.category}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {d.pickupLocation}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-replate-text">
                        {d.quantity} {d.unit}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-[#F2A44A]' : 'text-stone-400'}`} />
                          <span className={isUrgent ? 'font-semibold text-amber-700' : ''}>
                            {new Date(d.safeConsumptionDeadline).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {isExpired ? (
                            <span className="text-stone-500">Expired</span>
                          ) : (
                            <span>{hoursLeft.toFixed(1)}h remaining</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {d.requestCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleOpenRequests(d._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                          >
                            <Users className="w-3 h-3" />
                            {d.requestCount} Request{d.requestCount > 1 ? 's' : ''}
                          </button>
                        ) : (
                          <span className="text-stone-400 text-xs">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={d.status} />
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        {d.status === 'REQUESTED' && (
                          <button
                            type="button"
                            onClick={() => handleOpenRequests(d._id)}
                            className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                          >
                            Review Request
                          </button>
                        )}

                        <Link
                          to={`/tracking/${d._id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#16845B] hover:text-[#116747] hover:bg-[#EAF6EF] rounded-lg transition-colors border border-transparent hover:border-[#16845B]/20"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Track Timeline
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Review Requests Modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => {
          setRequestModalOpen(false);
          setFeedbackMsg('');
        }}
        title={`Review Requests: ${selectedDonation?.title || ''}`}
        subtitle={`Quantity: ${selectedDonation?.quantity} ${selectedDonation?.unit} · Pickup Deadline: ${selectedDonation ? new Date(selectedDonation.safeConsumptionDeadline).toLocaleTimeString() : ''}`}
        maxWidth="max-w-2xl"
      >
        {feedbackMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#16845B]" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-xs text-replate-subtext">
            The following recipient organizations have submitted requests to collect this surplus food batch:
          </p>

          {selectedDonation?.requests?.length === 0 ? (
            <div className="text-center py-6 text-xs text-stone-500">
              No pending requests found for this donation.
            </div>
          ) : (
            selectedDonation?.requests?.map((req) => (
              <div
                key={req._id}
                className="p-4 rounded-xl border border-replate-border bg-white hover:border-stone-300 transition-all text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="font-bold text-sm text-replate-text">
                      {req.ngo?.name || 'Partner Recipient Organization'}
                    </span>
                    <span className="text-[11px] text-replate-subtext block">
                      Zone: {req.ngo?.serviceArea || 'Hyderabad'} · Contact: {req.ngo?.contactPerson} ({req.ngo?.phone})
                    </span>
                  </div>

                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      req.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'REJECTED'
                        ? 'bg-stone-100 text-stone-600'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="p-3 bg-replate-muted rounded-lg text-replate-text mb-3 space-y-1">
                  <p>
                    <strong className="text-replate-subtext">Beneficiaries to feed:</strong> ~
                    {req.estimatedBeneficiaries} people
                  </p>
                  <p>
                    <strong className="text-replate-subtext">Recipient Note:</strong> "{req.notes || 'Ready to collect immediately.'}"
                  </p>
                  <p>
                    <strong className="text-replate-subtext">Pickup Preference:</strong> {req.pickupPreference}
                  </p>
                </div>

                {req.status === 'PENDING' && (
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleRequestDecision(req._id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleRequestDecision(req._id, 'ACCEPTED')}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#16845B] hover:bg-[#116747] transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept & Reserve Food
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          <div className="pt-4 border-t border-replate-border flex justify-end">
            <button
              type="button"
              onClick={() => {
                setRequestModalOpen(false);
                setFeedbackMsg('');
              }}
              className="px-4 py-2 rounded-lg bg-replate-muted hover:bg-stone-200 text-xs font-semibold text-replate-text"
            >
              Close Window
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
