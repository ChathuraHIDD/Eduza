import { apiFetch, getAuthToken } from "./api";

export const getMyGroups = async () => {
  const token = getAuthToken();

  return apiFetch("/api/chat/groups", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getGroupMessages = async (groupId) => {
  const token = getAuthToken();

  return apiFetch(`/api/chat/groups/${groupId}/messages`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const sendGroupMessage = async (groupId, payload) => {
  const token = getAuthToken();

  return apiFetch(`/api/chat/groups/${groupId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};