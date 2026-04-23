const STORAGE_KEY = "eduza_kuppi_requests";

const normalizeList = (value) => (Array.isArray(value) ? value : []);

export const getKuppiRequests = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return normalizeList(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
};

const persistKuppiRequests = (requests) => {
  const normalized = normalizeList(requests);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent("kuppi-requests-updated", { detail: normalized }));
};

export const createKuppiRequest = (formData, user = {}) => {
  const now = new Date().toISOString();
  const request = {
    _id: `kuppi-${Date.now()}`,
    requestType: "Kuppi Conductor",
    status: "pending",
    createdAt: now,
    updatedAt: now,
    studentName: user.name || user.fullName || user.username || formData.fullName || "Student",
    studentEmail: user.email || "No email",
    detail: `${formData.fullName} applied to conduct ${formData.moduleLikeToDo} under ${formData.mainSubject}.`,
    adminNote: "",
    ...formData,
  };

  const requests = getKuppiRequests();
  persistKuppiRequests([request, ...requests]);
  return request;
};

export const updateKuppiRequestStatus = (requestId, status, adminNote = "") => {
  const requests = getKuppiRequests().map((request) =>
    request._id === requestId
      ? {
          ...request,
          status,
          adminNote,
          updatedAt: new Date().toISOString(),
        }
      : request
  );

  persistKuppiRequests(requests);
  return requests.find((request) => request._id === requestId) || null;
};

export const getPendingKuppiRequests = () =>
  getKuppiRequests().filter((request) => request.status === "pending");
