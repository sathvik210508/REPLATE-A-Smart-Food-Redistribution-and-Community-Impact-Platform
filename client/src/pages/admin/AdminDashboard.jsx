import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Building2,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  RotateCcw,
  Search,
  Check,
  X,
  Eye,
  Calendar,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { KPIStatCard } from '../../components/ui/KPIStatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [orgsList, setOrgsList] = useState([]);
  const [donationsList, setDonationsList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, usersRes, orgsRes, donationsRes, logsRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAdminUsers(),
        api.getOrganizations(),
        api.getDonations(),
        api.getAdminAuditLogs(),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.kpis);
      if (usersRes.success) setUsersList(usersRes.users || []);
      if (orgsRes.success) setOrgsList(orgsRes.organizations || []);
      if (donationsRes.success) setDonationsList(donationsRes.donations || []);
      if (logsRes.success) setAuditLogs(logsRes.events || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await api.toggleUserStatus(userId);
      if (res.success) {
        setFeedback(res.message);
        await loadAdminData();
      }
    } catch (err) {
      setFeedback(`Error toggling status: ${err.message}`);
    }
  };

  const handleVerifyOrg = async (orgId, status) => {
    try {
      const res = await api.verifyOrganization(orgId, status);
      if (res.success) {
        setFeedback(res.message);
        await loadAdminData();
      }
    } catch (err) {
      setFeedback(`Error verifying org: ${err.message}`);
    }
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset and re-seed sample demonstration records for Hyderabad/CBIT?')) return;
    try {
      setLoading(true);
      const res = await api.seedSystemData();
      if (res.success) {
        setFeedback('Demo database successfully refreshed with clean demonstration dataset.');
        await loadAdminData();
      }
    } catch (err) {
      setFeedback(`Reset error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Platform Operations & Audit Console"
      subtitle={`Administrator: ${user?.name || 'Dr. K. Srinivas (CBIT Ideathon Admin)'}`}
    >
      {/* Top Banner & Seed Reset Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-card border border-replate-border shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <h2 className="text-base font-bold text-replate-text">
              REPLATE Platform Administration
            </h2>
          </div>
          <p className="text-xs text-replate-subtext mt-0.5">
            Real-time multi-tenant monitoring, organization validation, and immutable audit logs.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetSeed}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors border border-stone-200"
          title="Reset database to default seed records"
        >
          <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
          Reset Demo Database
        </button>
      </div>

      {feedback && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
            {feedback}
          </span>
          <button
            type="button"
            onClick={() => setFeedback('')}
            className="text-stone-400 hover:text-stone-600 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-8">
        <KPIStatCard
          title="Total Users"
          value={analytics?.totalUsers ?? usersList.length}
          subtext="Active accounts"
          icon={Users}
        />
        <KPIStatCard
          title="Food Donors"
          value={analytics?.registeredDonors ?? 2}
          subtext="Canteens & hotels"
          icon={UtensilsCrossed}
        />
        <KPIStatCard
          title="Registered NGOs"
          value={analytics?.registeredNgos ?? 2}
          subtext="Verified kitchens"
          icon={Building2}
        />
        <KPIStatCard
          title="Volunteers"
          value={analytics?.registeredVolunteers ?? 1}
          subtext="Logistics network"
          icon={Users}
        />
        <KPIStatCard
          title="Active Listings"
          value={analytics?.activeDonations ?? 4}
          subtext="In redistribution"
          icon={Clock}
          badgeText="Live"
          badgeColor="green"
        />
        <KPIStatCard
          title="Completed"
          value={analytics?.completedDonations ?? 2}
          subtext="Verified served"
          icon={CheckCircle2}
          badgeText="100%"
          badgeColor="green"
        />
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-replate-border mb-6 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-3 font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-replate-subtext hover:text-replate-text'
          }`}
        >
          User Accounts ({usersList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orgs')}
          className={`pb-3 px-3 font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'orgs'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-replate-subtext hover:text-replate-text'
          }`}
        >
          Organizations ({orgsList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('donations')}
          className={`pb-3 px-3 font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'donations'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-replate-subtext hover:text-replate-text'
          }`}
        >
          All Surplus Listings ({donationsList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-3 font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'logs'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-replate-subtext hover:text-replate-text'
          }`}
        >
          Audit History Trail ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-card border border-replate-border shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-replate-border bg-replate-muted/50 text-replate-subtext font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Platform Role</th>
                  <th className="py-3 px-4">Associated Organization</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-replate-border/70 text-replate-text">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-replate-muted/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-replate-text">{u.name}</td>
                    <td className="py-3 px-4 text-stone-500">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.organization?.name || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleUserStatus(u._id)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                          u.status === 'active'
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ORGANIZATIONS */}
      {activeTab === 'orgs' && (
        <div className="bg-white rounded-card border border-replate-border shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-replate-border bg-replate-muted/50 text-replate-subtext font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Service Area</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-replate-border/70 text-replate-text">
                {orgsList.map((o) => (
                  <tr key={o._id} className="hover:bg-replate-muted/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-replate-text">{o.name}</td>
                    <td className="py-3 px-4 text-stone-500">{o.type}</td>
                    <td className="py-3 px-4">{o.serviceArea}</td>
                    <td className="py-3 px-4 text-stone-500">
                      {o.contactPerson} ({o.phone})
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          o.verificationStatus === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {o.verificationStatus !== 'verified' ? (
                        <button
                          type="button"
                          onClick={() => handleVerifyOrg(o._id, 'verified')}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          Verify Org
                        </button>
                      ) : (
                        <span className="text-stone-400 text-xs">Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALL DONATIONS */}
      {activeTab === 'donations' && (
        <div className="bg-white rounded-card border border-replate-border shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-replate-border bg-replate-muted/50 text-replate-subtext font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Food Batch Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Zone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-replate-border/70 text-replate-text">
                {donationsList.map((d) => (
                  <tr key={d._id} className="hover:bg-replate-muted/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-replate-text">{d.title}</td>
                    <td className="py-3 px-4 text-stone-500">{d.category}</td>
                    <td className="py-3 px-4 font-medium">
                      {d.quantity} {d.unit}
                    </td>
                    <td className="py-3 px-4">{d.serviceArea}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/tracking/${d._id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16845B] hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Audit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-card border border-replate-border shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-replate-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Complete Event Log ({auditLogs.length} events recorded)
            </h3>
          </div>
          <div className="divide-y divide-replate-border/70 text-xs">
            {auditLogs.map((log) => (
              <div key={log._id} className="p-4 hover:bg-replate-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-replate-text text-xs">
                      {log.eventType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-stone-400">·</span>
                    <span className="text-[11px] text-stone-600 font-medium">
                      {log.actorName} ({log.actorRole})
                    </span>
                  </div>
                  <p className="text-stone-500 text-[11px]">{log.notes}</p>
                </div>

                <div className="text-right text-[11px] text-stone-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
