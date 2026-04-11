import { apiFetch, getAuthToken } from "./api";

export const searchChatUsers = async (query) => {
  const token = getAuthToken();

  return apiFetch(`/api/chat-users/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createOrOpenDirectChat = async (userId) => {
  const token = getAuthToken();

  return apiFetch("/api/chat-users/direct", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });
};