const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('replate_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};

export const api = {
  // Auth
  async register(payload) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async login(payload) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async demoLogin(role) {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Donations
  async getDonations(params = {}) {
    const query = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key]) query.append(key, params[key]);
    });
    const res = await fetch(`${API_BASE}/donations?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getDonationById(id) {
    const res = await fetch(`${API_BASE}/donations/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createDonation(payload) {
    const res = await fetch(`${API_BASE}/donations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateDonationStatus(id, status, notes = '') {
    const res = await fetch(`${API_BASE}/donations/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    return handleResponse(res);
  },

  async getRecommendedMatches() {
    const res = await fetch(`${API_BASE}/donations/matches/recommended`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Requests
  async createRequest(donationId, payload) {
    const res = await fetch(`${API_BASE}/requests/donation/${donationId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getMyRequests() {
    const res = await fetch(`${API_BASE}/requests/my`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateRequestStatus(id, status, decisionNotes = '') {
    const res = await fetch(`${API_BASE}/requests/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, decisionNotes }),
    });
    return handleResponse(res);
  },

  // Tracking
  async getTrackingEvents(donationId) {
    const res = await fetch(`${API_BASE}/tracking/${donationId}/events`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async addTrackingEvent(donationId, eventType, notes = '') {
    const res = await fetch(`${API_BASE}/tracking/${donationId}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ eventType, notes }),
    });
    return handleResponse(res);
  },

  // Analytics
  async getImpactAnalytics(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/analytics/impact?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getDonorAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/donor`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getNgoAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/ngo`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/admin`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Organizations
  async getOrganizations(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/organizations?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Admin
  async getAdminUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async toggleUserStatus(id) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async verifyOrganization(id, verificationStatus) {
    const res = await fetch(`${API_BASE}/admin/organizations/${id}/verify`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ verificationStatus }),
    });
    return handleResponse(res);
  },

  async getAdminAuditLogs() {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async seedSystemData() {
    const res = await fetch(`${API_BASE}/admin/seed-data`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // System
  async getSystemStatus() {
    const res = await fetch(`${API_BASE}/system/status`);
    return handleResponse(res);
  },

  async resetSeed() {
    const res = await fetch(`${API_BASE}/system/seed`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};
