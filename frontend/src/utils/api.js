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