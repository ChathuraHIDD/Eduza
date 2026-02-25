const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const body = await response.json();
      message = body.message || message;
    } catch {
      message = `Request failed with status ${response.status}`;
    }
    throw new Error(message);
  }

  return response.json();
};

export const getStressHubConfig = () => request('/api/stress-hub/config');

export const createStressLog = (payload) =>
  request('/api/stress-hub/stress-logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getStressLogs = (studentId) => {
  const params = new URLSearchParams();
  if (studentId) params.append('studentId', studentId);
  params.append('limit', '20');
  return request(`/api/stress-hub/stress-logs?${params.toString()}`);
};

export const createRelaxationSession = (payload) =>
  request('/api/stress-hub/relaxation-sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getStressDashboard = (studentId, periodDays = 14) => {
  const params = new URLSearchParams();
  if (studentId) params.append('studentId', studentId);
  params.append('periodDays', String(periodDays));
  return request(`/api/stress-hub/dashboard?${params.toString()}`);
};

export const getStressAlerts = (studentId, status) => {
  const params = new URLSearchParams();
  if (studentId) params.append('studentId', studentId);
  if (status) params.append('status', status);
  return request(`/api/stress-hub/alerts?${params.toString()}`);
};

export const acknowledgeStressAlert = (alertId) =>
  request(`/api/stress-hub/alerts/${alertId}/acknowledge`, {
    method: 'PATCH',
  });
