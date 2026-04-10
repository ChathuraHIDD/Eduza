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

export const createGroupWithMembers = async (payload) => {
    const token = getAuthToken();

    return apiFetch("/api/chat/groups/create-with-members", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
};

export const renameGroupRequest = async (groupId, payload) => {
    const token = getAuthToken();
  
    return apiFetch(`/api/chat/groups/${groupId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  };
  
  export const addGroupMembersRequest = async (groupId, memberIds) => {
    const token = getAuthToken();
  
    return apiFetch(`/api/chat/groups/${groupId}/members`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ memberIds }),
    });
  };
  
  export const removeGroupMemberRequest = async (groupId, userId) => {
    const token = getAuthToken();
  
    return apiFetch(`/api/chat/groups/${groupId}/members/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };