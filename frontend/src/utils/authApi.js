import { apiFetch } from "./api";

/* ---------------- REGISTER ---------------- */

export async function registerUser(userData) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

/* ---------------- LOGIN ---------------- */

export async function loginUser(credentials) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

/* ---------------- GET CURRENT USER ---------------- */

export async function getCurrentUser(token) {
  return apiFetch("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}