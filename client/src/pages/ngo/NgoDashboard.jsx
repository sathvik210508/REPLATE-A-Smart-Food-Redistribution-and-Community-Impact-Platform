import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Utensils,
  Layers,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  Check,
  Eye,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { KPIStatCard } from '../../components/ui/KPIStatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const NgoDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'discover';

  const [donations, setDonations] = useState([]);
  const [matches, setMatches] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [areaFilter, setAreaFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('recent');

  // Request Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState(30);
  const [requestNotes, setRequestNotes] = useState('');
  const [pickupPreference, setPickupPreference] = useState('Shelter van pickup arranged within 45 mins');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestFeedback, setRequestFeedback] = useState('');

  // Donation Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailDonation, setDetailDonation] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [donationsRes, kpisRes, requestsRes, matchesRes] = await Promise.all([
        api.getDonations({ category: categoryFilter, serviceArea: areaFilter, sort: sortOption }),
        api.getNgoAnalytics(),
        api.getMyRequests(),
        api.getRecommendedMatches().catch(() => ({ success: false })),
      ]);

      if (donationsRes.success) setDonations(donationsRes.donations || []);
      if (kpisRes.success) setKpis(kpisRes.kpis);
      if (requestsRes.success) setMyRequests(requestsRes.requests || []);
      if (matchesRes && matchesRes.success) setMatches(matchesRes.matches || []);
    } catch (err) {
      console.error('Failed to load NGO dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, categoryFilter, areaFilter, sortOption]);

  const handleOpenRequestModal = (donation) => {
    setSelectedDonation(donation);
    setBeneficiaries(donation.minAcceptQuantity ? Math.max(donation.minAcceptQuantity, 25) : 30);
    setRequestNotes('');
    setRequestFeedback('');
    setRequestModalOpen(true);
  };

  const handleOpenDetailModal = (donation) => {
    setDetailDonation(donation);
    setDetailModalOpen(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedDonation) return;

    setSubmittingRequest(true);
    setRequestFeedback('');

    try {
      const payload = {
        estimatedBeneficiaries: Number(beneficiaries) || 20,
        notes: requestNotes,
        pickupPreference,
      };

      const res = await api.createRequest(selectedDonation._id, payload);
      if (res.success) {
        setRequestFeedback('Request successfully recorded! The food donor has been notified.');
        await loadData();
        setTimeout(() => {
          setRequestModalOpen(false);
          setRequestFeedback('');
        }, 1500);
      }
    } catch (err) {
      setRequestFeedback(`Request failed: ${err.message}`);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const getHoursRemaining = (iso) => {
    return parseFloat(Math.max(0, (new Date(iso) - new Date()) / (1000 * 60 * 60)).toFixed(1));
  };

  // Filtered Discover List
  const discoverList = donations.filter((d) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.pickupLocation.toLowerCase().includes(q) ||
      d.organization?.name?.toLowerCase().includes(q);
    return matchesSearch;
  });

  return (
    <DashboardLayout
      title="Surplus Discovery & Allocation"
      subtitle={`Welcome back, ${user?.name || 'Priya Sharma'}. Discover food and coordinate redistribution.`}
    >
      {/* Top Organization Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-card border border-replate-border shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h2 className="text-base font-bold text-replate-text">
              {user?.organization?.name || 'Akshaya Seva Food Foundation'}
            </h2>
          </div>
          <p className="text-xs text-replate-subtext mt-0.5">
            Zone: {user?.organization?.serviceArea || 'Gandipet / Gachibowli'} · Verified Community Kitchen
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'matches' })}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              activeTab === 'matches'
                ? 'bg-[#16845B] text-white border-[#16845B]'
                : 'bg-[#EAF6EF] text-[#116747] border-[#16845B]/30 hover:bg-[#16845B] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Rule-Based Smart Matches
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPIStatCard
          title="Available Nearby"
          value={kpis?.availableNearby ?? donations.filter((d) => d.status === 'AVAILABLE').length}
          subtext="Ready for immediate request"
          icon={Utensils}
          badgeText="Active"
          badgeColor="green"
        />
        <KPIStatCard
          title="My Active Requests"
          value={kpis?.myActiveRequests ?? myRequests.filter((r) => r.status === 'PENDING').length}
          subtext="Awaiting donor acceptance"
          icon={Clock}
          badgeText={myRequests.length > 0 ? 'Pending' : '0'}
          badgeColor="orange"
        />
        <KPIStatCard
          title="Accepted Donations"
          value={kpis?.acceptedDonations ?? myRequests.filter((r) => r.status === 'ACCEPTED').length}
          subtext="Reserved for pickup"
          icon={CheckCircle2}
          badgeText="Scheduled"
          badgeColor="green"
        />
        <KPIStatCard
          title="Completed Collections"
          value={kpis?.completedCollections ?? 2}
          subtext="Meals distributed to community"
          icon={HeartHandshake}
          badgeText="Verified"
          badgeColor="green"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-replate-border mb-6">
        <button
          type="button"
          onClick={() => setSearchParams({ tab: 'discover' })}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'discover'
              ? 'border-[#16845B] text-[#16845B]'
              : 'border-transparent text-replate-subtext hover:text-replate-text'
          }`}
        >
          <Search className="w-4 h-4" />
          Discover Food ({discoverList.length})
        </button>

        <button
          type="button"
          onClick={() => setSearchParams({ tab: 'matches' })}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'matches'
              ? 'border-[#16845B] text-[#16845B]'
              : 'border-transparent text-replate-subtext hover:text-replate-text'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Smart Matches
        </button>

        <button
          type="button"
          onClick={() => setSearchParams({ tab: 'requests' })}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'border-[#16845B] text-[#16845B]'
              : 'border-transparent text-replate-subtext hover:text-replate-text'
          }`}
        >
          <Layers className="w-4 h-4" />
          My Requests ({myRequests.length})
        </button>
      </div>

      {/* TAB 1: DISCOVER SURPLUS FOOD */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-card border border-replate-border shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-replate-subtext" />
              <input
                type="text"
                placeholder="Search food item, canteen, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2 py-1 focus:outline-none text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-replate-border bg-white text-replate-text text-xs"
              >
                <option value="All">All Categories</option>
                <option value="Prepared Meals">Prepared Meals</option>
                <option value="Bakery & Bread">Bakery & Bread</option>
                <option value="Fresh Produce & Fruits">Fresh Produce & Fruits</option>
                <option value="Dairy & Refrigerated">Dairy & Refrigerated</option>
              </select>

              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-replate-border bg-white text-replate-text text-xs"
              >
                <option value="All">All Service Zones</option>
                <option value="Gandipet">Gandipet / CBIT</option>
                <option value="Gachibowli">Gachibowli</option>
                <option value="Banjara Hills">Banjara Hills</option>
                <option value="Hitec City">Hitec City</option>
              </select>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-replate-border bg-white text-replate-text text-xs font-medium"
              >
                <option value="recent">Recently Listed</option>
                <option value="deadline">Earliest Deadline</option>
                <option value="quantity">Largest Quantity</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="py-12 text-center text-xs text-replate-subtext">
              Searching surplus food listings...
            </div>
          ) : discoverList.length === 0 ? (
            <EmptyState
              title="No surplus food listings match your filters"
              description="Try adjusting your category or zone filters to see other available listings across Hyderabad."
              actionText="Reset Filters"
              onAction={() => {
                setCategoryFilter('All');
                setAreaFilter('All');
                setSearchQuery('');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discoverList.map((d) => {
                const hoursRemaining = getHoursRemaining(d.safeConsumptionDeadline);
                const isUrgent = hoursRemaining > 0 && hoursRemaining < 3;
                const isAvailable = d.status === 'AVAILABLE' || d.status === 'REQUESTED';
                const hasMyRequest = myRequests.some(
                  (r) => String(r.donationId) === String(d._id) && r.status === 'PENDING'
                );

                return (
                  <div
                    key={d._id}
                    className="bg-white rounded-card border border-replate-border shadow-subtle hover:border-[#16845B]/50 transition-all p-5 flex flex-col justify-between text-xs space-y-4"
                  >
                    <div>
                      {/* Top Category & Status */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold text-[#16845B] bg-[#EAF6EF] px-2 py-0.5 rounded-full uppercase">
                          {d.category}
                        </span>
                        <StatusBadge status={d.status} />
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-bold text-replate-text line-clamp-1">{d.title}</h4>

                      {/* Description */}
                      <p className="text-replate-subtext mt-1 line-clamp-2 leading-relaxed">
                        {d.description}
                      </p>

                      {/* Donor Org & Location */}
                      <div className="mt-3 p-2.5 bg-replate-muted/70 rounded-lg space-y-1">
                        <p className="font-semibold text-replate-text flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-stone-400" />
                          {d.organization?.name || 'CBIT Canteen'}
                        </p>
                        <p className="text-replate-subtext flex items-center gap-1.5 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          {d.pickupLocation} ({d.serviceArea})
                        </p>
                      </div>

                      {/* Portion & Deadline metadata */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-stone-600">
                        <div className="p-2 border border-replate-border rounded-lg">
                          <span className="text-[10px] text-stone-400 block uppercase">Quantity</span>
                          <span className="font-bold text-replate-text">
                            {d.quantity} {d.unit}
                          </span>
                        </div>
                        <div className="p-2 border border-replate-border rounded-lg">
                          <span className="text-[10px] text-stone-400 block uppercase">Deadline</span>
                          <span className={`font-bold ${isUrgent ? 'text-[#F2A44A]' : 'text-replate-text'}`}>
                            {hoursRemaining}h left
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-2 border-t border-replate-border flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDetailModal(d)}
                        className="py-1.5 px-3 rounded-lg border border-replate-border text-replate-text hover:bg-replate-muted font-medium transition-colors"
                      >
                        Details
                      </button>

                      {hasMyRequest ? (
                        <span className="py-1.5 px-3 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                          Request Pending
                        </span>
                      ) : isAvailable ? (
                        <button
                          type="button"
                          onClick={() => handleOpenRequestModal(d)}
                          className="py-1.5 px-4 rounded-lg bg-[#16845B] hover:bg-[#116747] text-white font-semibold transition-all shadow-sm flex items-center gap-1"
                        >
                          Request Donation
                        </button>
                      ) : (
                        <Link
                          to={`/tracking/${d._id}`}
                          className="py-1.5 px-3 rounded-lg bg-replate-muted text-stone-700 font-medium hover:bg-stone-200"
                        >
                          Track Status
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SMART MATCHES (EXPLAINABLE RULE-BASED MATCHING) */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#EAF6EF] border border-[#16845B]/30 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#16845B]" />
              <h3 className="font-bold text-[#116747]">
                Explainable Rule-Based Matching Engine
              </h3>
            </div>
            <p className="text-[#116747]/90 leading-relaxed">
              Matched in real time based on your organization's service area ({user?.organization?.serviceArea || 'Gandipet'}), safe-consumption countdown viability, and dietary safety standards. Transparent rules — no opaque algorithms.
            </p>
          </div>

          <div className="space-y-4">
            {matches.length === 0 ? (
              <EmptyState
                title="No active matches calculated"
                description="All available listings in your immediate zone have either been requested or completed."
                actionText="Explore All Listings"
                onAction={() => setSearchParams({ tab: 'discover' })}
              />
            ) : (
              matches.map((item) => (
                <div
                  key={item.donation._id}
                  className="bg-white rounded-card border border-replate-border p-5 shadow-subtle text-xs hover:border-[#16845B]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF6EF] text-[#116747] border border-[#16845B]/30">
                        {item.score}% Match Compatibility
                      </span>
                      <span className="text-stone-400 font-semibold">{item.donation.category}</span>
                      <span className="text-stone-300">·</span>
                      <span className="text-amber-700 font-medium">
                        {item.hoursRemaining} hours before safe deadline
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-replate-text">
                      {item.donation.title}
                    </h4>

                    <p className="text-replate-subtext max-w-2xl">
                      {item.donation.description}
                    </p>

                    {/* Why this matches pill list */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                        Why this donation matches:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.matchReasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-[11px]"
                          >
                            <Check className="w-3 h-3 text-[#16845B]" />
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right side CTA */}
                  <div className="shrink-0 flex flex-col items-end gap-2 border-t md:border-t-0 md:border-l border-replate-border pt-4 md:pt-0 md:pl-6">
                    <div className="text-right">
                      <span className="text-xs text-stone-400 block">Available Quantity</span>
                      <span className="text-base font-bold text-replate-text">
                        {item.donation.quantity} {item.donation.unit}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenRequestModal(item.donation)}
                      className="px-5 py-2.5 rounded-lg bg-[#16845B] hover:bg-[#116747] text-white font-semibold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      Request Food Batch
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MY REQUESTS */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-card border border-replate-border shadow-subtle overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-replate-border">
            <h3 className="text-sm font-bold text-replate-text">My Active Donation Requests</h3>
            <p className="text-xs text-replate-subtext">
              Track requests submitted to food donors and monitor handover timelines.
            </p>
          </div>

          <div className="overflow-x-auto">
            {myRequests.length === 0 ? (
              <EmptyState
                title="No active requests submitted"
                description="Browse available surplus food and submit a request to allocate meals for your beneficiaries."
                actionText="Discover Surplus Food"
                onAction={() => setSearchParams({ tab: 'discover' })}
              />
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-replate-border bg-replate-muted/50 text-replate-subtext font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Requested Food Batch</th>
                    <th className="py-3 px-4">Donor Organization</th>
                    <th className="py-3 px-4">Beneficiaries</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4">Request Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-replate-border/70 text-replate-text">
                  {myRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-replate-muted/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-replate-text">
                          {req.donation?.title || 'Food Donation'}
                        </div>
                        <div className="text-[11px] text-replate-subtext">
                          {req.donation?.quantity} {req.donation?.unit}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-replate-text">
                          {req.donation?.organization?.name || 'CBIT Canteen'}
                        </div>
                        <div className="text-[11px] text-replate-subtext">
                          {req.donation?.serviceArea}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-replate-text">
                        ~{req.estimatedBeneficiaries} people
                      </td>

                      <td className="py-3 px-4 text-replate-subtext">
                        {new Date(req.requestTimestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            req.status === 'ACCEPTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'REJECTED'
                              ? 'bg-stone-100 text-stone-600'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {req.donation && (
                          <Link
                            to={`/tracking/${req.donation._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-[#16845B] hover:text-[#116747] hover:bg-[#EAF6EF] rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Track Progress
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* REQUEST DONATION MODAL */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title={`Request Food Batch: ${selectedDonation?.title || ''}`}
        subtitle={`Available: ${selectedDonation?.quantity} ${selectedDonation?.unit} · Pickup Deadline: ${selectedDonation ? new Date(selectedDonation.safeConsumptionDeadline).toLocaleTimeString() : ''}`}
        maxWidth="max-w-lg"
      >
        {requestFeedback && (
          <div
            className={`mb-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
              requestFeedback.includes('failed')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {requestFeedback.includes('failed') ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16845B]" />
            )}
            <span>{requestFeedback}</span>
          </div>
        )}

        <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-replate-text mb-1">
              Estimated Beneficiaries to Feed *
            </label>
            <input
              type="number"
              min="1"
              max={selectedDonation?.quantity * 2 || 200}
              required
              value={beneficiaries}
              onChange={(e) => setBeneficiaries(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs focus:ring-1 focus:ring-[#16845B]"
            />
            <span className="text-[11px] text-stone-500 mt-1 block">
              Helps donor verify that portion size matches your community kitchen needs.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-replate-text mb-1">
              Pickup Transportation & Window Preference
            </label>
            <input
              type="text"
              required
              value={pickupPreference}
              onChange={(e) => setPickupPreference(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-replate-text mb-1">
              Recipient Note to Donor
            </label>
            <textarea
              rows={2}
              value={requestNotes}
              onChange={(e) => setRequestNotes(e.target.value)}
              placeholder="e.g. Bringing insulated thermal carriers; will distribute for evening shelter dinner."
              className="w-full px-3 py-2 rounded-lg border border-replate-border text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-replate-border">
            <button
              type="button"
              onClick={() => setRequestModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-replate-muted text-stone-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingRequest}
              className="px-5 py-2 rounded-lg bg-[#16845B] hover:bg-[#116747] text-white font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {submittingRequest ? 'Submitting...' : 'Confirm Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={detailDonation?.title || 'Donation Details'}
        subtitle={`Category: ${detailDonation?.category} · Status: ${detailDonation?.status}`}
        maxWidth="max-w-xl"
      >
        {detailDonation && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-replate-muted rounded-xl space-y-1">
              <p className="font-semibold text-replate-text">{detailDonation.description}</p>
              <p className="text-stone-500">
                Dietary:{' '}
                {detailDonation.isVegetarian ? '100% Vegetarian' : 'Non-Vegetarian'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-replate-border rounded-lg">
                <span className="text-[10px] text-stone-400 block uppercase">Quantity</span>
                <span className="font-bold text-sm text-replate-text">
                  {detailDonation.quantity} {detailDonation.unit}
                </span>
              </div>
              <div className="p-3 border border-replate-border rounded-lg">
                <span className="text-[10px] text-stone-400 block uppercase">Deadline</span>
                <span className="font-bold text-sm text-amber-700">
                  {new Date(detailDonation.safeConsumptionDeadline).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-replate-text">
              <p>
                <strong>Pickup Location:</strong> {detailDonation.pickupLocation} (
                {detailDonation.serviceArea})
              </p>
              <p>
                <strong>Donor Organization:</strong>{' '}
                {detailDonation.organization?.name || 'CBIT Canteen'}
              </p>
              <p>
                <strong>Storage Requirements:</strong> {detailDonation.storageRequirements}
              </p>
              <p>
                <strong>Allergen Info:</strong> {detailDonation.allergenInfo}
              </p>
              {detailDonation.recipientNotes && (
                <p>
                  <strong>Donor Instructions:</strong> {detailDonation.recipientNotes}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-replate-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-replate-muted text-stone-700 font-semibold"
              >
                Close
              </button>
              {detailDonation.status === 'AVAILABLE' && (
                <button
                  type="button"
                  onClick={() => {
                    setDetailModalOpen(false);
                    handleOpenRequestModal(detailDonation);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#16845B] hover:bg-[#116747] text-white font-semibold"
                >
                  Request Donation
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};
