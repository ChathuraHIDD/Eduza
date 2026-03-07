const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // Handle non-JSON or error responses safely
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      (data && data.message) ||
      (typeof data === "string" ? data : "") ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

// login/register
export function getAuthToken() {
  return localStorage.getItem("token");
}

// login/register
export function getStoredUser() {
  const rawUser = localStorage.getItem("user");
  return rawUser ? JSON.parse(rawUser) : null;
}

// login/register
export function setAuthData(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
}

// login/register
export function clearAuthData() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// login/register
export async function registerRequest(payload) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// login/register
export async function loginRequest(payload) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// login/register
export async function getMeRequest() {
  const token = getAuthToken();

  return apiFetch("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// software - create
export async function createSoftwareRequest(payload) {
  const token = getAuthToken();

  return apiFetch("/api/software", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

// software - list
export async function getSoftwareListRequest() {
  return apiFetch("/api/software", {
    method: "GET",
  });
}

// software - single
export async function getSoftwareByIdRequest(id) {
  return apiFetch(`/api/software/${id}`, {
    method: "GET",
  });
}