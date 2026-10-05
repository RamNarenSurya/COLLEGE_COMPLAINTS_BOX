const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('complaint_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('complaint_token', token);
  } else {
    localStorage.removeItem('complaint_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'API Request Failed');
  }

  return data;
}

export const api = {
  // Auth
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),

  // Departments & Staff (Public / General)
  getDepartments: (includeInactive = false) => request(`/departments?includeInactive=${includeInactive}`),

  // Student APIs
  submitComplaint: (formData) => request('/complaints', { method: 'POST', body: formData }),
  getMyComplaints: () => request('/complaints/my'),
  getComplaintDetail: (id) => request(`/complaints/${id}`),
  updateStudentComplaint: (id, action, comment) => request(`/complaints/${id}`, { method: 'PATCH', body: JSON.stringify({ action, comment }) }),
  submitFeedback: (id, rating, comment) => request(`/complaints/${id}/feedback`, { method: 'POST', body: JSON.stringify({ rating, comment }) }),

  // Admin APIs
  getAdminComplaints: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/complaints?${query}`);
  },
  getAdminComplaintDetail: (id) => request(`/admin/complaints/${id}`),
  updateComplaintStatus: (id, status, comment) => request(`/admin/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, comment }) }),
  assignDepartment: (id, department_id) => request(`/admin/complaints/${id}/department`, { method: 'PATCH', body: JSON.stringify({ department_id }) }),
  assignStaff: (id, assigned_staff_id) => request(`/admin/complaints/${id}/staff`, { method: 'PATCH', body: JSON.stringify({ assigned_staff_id }) }),
  updatePriority: (id, priority) => request(`/admin/complaints/${id}/priority`, { method: 'PATCH', body: JSON.stringify({ priority }) }),
  addAdminComment: (id, comment) => request(`/admin/complaints/${id}/comments`, { method: 'POST', body: JSON.stringify({ comment }) }),
  addResolution: (id, resolutionData) => request(`/admin/complaints/${id}/resolution`, { method: 'POST', body: JSON.stringify(resolutionData) }),
  getStatistics: () => request('/admin/statistics'),
  getLoginHistory: () => request('/admin/login-history'),

  // Admin Department & Staff Management
  createDepartment: (deptData) => request('/departments', { method: 'POST', body: JSON.stringify(deptData) }),
  updateDepartment: (id, deptData) => request(`/departments/${id}`, { method: 'PATCH', body: JSON.stringify(deptData) }),
  deleteDepartment: (id) => request(`/departments/${id}`, { method: 'DELETE' }),

  getStaffList: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/staff?${query}`);
  },
  createStaff: (staffData) => request('/staff', { method: 'POST', body: JSON.stringify(staffData) }),
  updateStaff: (id, staffData) => request(`/staff/${id}`, { method: 'PATCH', body: JSON.stringify(staffData) }),
  deleteStaff: (id) => request(`/staff/${id}`, { method: 'DELETE' })
};
