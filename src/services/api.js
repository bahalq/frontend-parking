import { HAS_API_BASE_URL, buildApiUrl } from "../config/api";
import i18n from "../i18n";

// Helper to get token
const getToken = () => localStorage.getItem("auth_token");

// Helper for fetch with Sanctum Token
const fetchAPI = async (endpoint, options = {}) => {
  if (!HAS_API_BASE_URL) {
    return {
      success: false,
      message: "API base URL is not configured.",
    };
  }

  const token = getToken();
  const defaultHeaders = {
    Accept: "application/json",
  };

   // Locale headers for backend translations
   const locale = (i18n.language || navigator.language || "en").slice(0, 2);
   defaultHeaders["X-App-Locale"] = locale;
   defaultHeaders["Accept-Language"] = locale;

  if (!(options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    credentials: "include",
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const url = buildApiUrl(endpoint);
  let response;

  try {
    response = await fetch(url, config);
  } catch (error) {
    return {
      success: false,
      message: "Unable to reach the API. Please check that the Laravel server is running.",
      status: 0,
    };
  }

  if (response.status === 401) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("staff_user");
    window.dispatchEvent(new CustomEvent("auth-error"));
    const isStaff = window.location.pathname.startsWith("/staff") || window.location.hash.startsWith("#/staff");
    window.location.hash = isStaff ? "#/staff/login" : "#/admin/login";
    return {
      success: false,
      message: "Session expired. Please login again.",
      status: 401,
    };
  }

  if (response.status === 403) {
    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      message: errorData.message || errorData.errors?.email?.[0] || null,
      status: 403,
    };
  }

  if (response.status === 429) {
    return {
      success: false,
      message: "Too many requests. Please wait a moment and try again.",
      status: 429,
    };
  }

  const data = await response.json().catch(() => ({
    success: response.ok,
    message: response.statusText,
  }));
  return data;
};

export const api = {
  // Auth
  login: async (creds) => {
    const data = await fetchAPI("login", {
      method: "POST",
      body: JSON.stringify(creds),
    });
    if (data.success && data.token) {
      localStorage.setItem("auth_token", data.token);
    }
    return data;
  },
  adminLogin: async (creds) => {
    const data = await fetchAPI("admin/login", {
      method: "POST",
      body: JSON.stringify(creds),
    });
    if (data.success && data.token) {
      localStorage.setItem("auth_token", data.token);
    }
    return data;
  },
  staffLogin: async (creds) => {
    const data = await fetchAPI("staff/login", {
      method: "POST",
      body: JSON.stringify(creds),
    });
    if (data.success && data.token) {
      localStorage.setItem("auth_token", data.token);
    }
    return data;
  },
  logout: async () => {
    const data = await fetchAPI("logout", { method: "POST" });
    localStorage.removeItem("auth_token");
    localStorage.removeItem("staff_user");
    return data;
  },
  checkAuth: () => {
    if (!getToken() || !HAS_API_BASE_URL) {
      return Promise.resolve({ success: false, user: null });
    }

    return fetchAPI("me");
  }, // maps to /api/me

  // Grounds
  getAllGrounds: (page = 1) => fetchAPI(`grounds?page=${page}`),
  getGroundDetails: (id) => fetchAPI(`grounds/${id}`),
  getGroundPrices: () => fetchAPI("grounds"), // Assuming this is handled or redirected

  // Activities/Terrains
  getActivities: () => fetchAPI("activities"),
  getTerrainsByActivity: (groundId, activityId) =>
    fetchAPI(
      `terrains/by-activity?ground_id=${groundId}&activity_id=${activityId}`,
    ),
  getTerrainsByGround: (groundId, page = 1) => fetchAPI(`terrains?ground_id=${groundId}&page=${page}`),

  // Booking
  getAvailability: (terrainId, date) =>
    fetchAPI(`terrains/availability?terrain_id=${terrainId}&date=${date}`),
  getMonthAvailability: (terrainId, year, month) =>
    fetchAPI(
      `terrains/month-availability?terrain_id=${terrainId}&year=${year}&month=${month}`,
    ),
  createBooking: (bookingData) =>
    fetchAPI("bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    }),
   confirmBookingByCode: (bookingId, code) =>
     fetchAPI("bookings/confirm", {
       method: "POST",
       body: JSON.stringify({ token: String(bookingId), code }),
     }),
   resendConfirmationCode: (bookingId) =>
     fetchAPI("bookings/resend", {
       method: "POST",
       body: JSON.stringify({ token: String(bookingId) }),
     }),
   verifyTicket: (reference) =>
     fetchAPI(`bookings/verify?reference=${reference}`),
   verifyBookingByToken: (token) =>
     fetchAPI(`bookings/verify?token=${encodeURIComponent(token)}`),
   staffVerifyTicket: (reference) =>
     fetchAPI(`staff/verify?reference=${reference}`),
   staffVerifyBookingByToken: (token) =>
     fetchAPI(`staff/verify?token=${encodeURIComponent(token)}`),

  // Admin Actions
  createGround: (formData) =>
    fetchAPI("admin/grounds", { method: "POST", body: formData }),
  addTerrain: (formData) =>
    fetchAPI("admin/terrains", { method: "POST", body: formData }),
  updateTerrain: (id, formData) => {
    formData.append("_method", "PATCH");
    return fetchAPI(`admin/terrains/${id}`, { method: "POST", body: formData });
  },
  deleteTerrain: (id) => fetchAPI(`admin/terrains/${id}`, { method: "DELETE" }),
  deleteGround: (id) => fetchAPI(`admin/grounds/${id}`, { method: "DELETE" }),

  // Admin booking data
  getAllBookings: (page = 1) => fetchAPI(`admin/bookings?page=${page}`),
  getAllClients: (page = 1) => fetchAPI(`admin/clients?page=${page}`),
  cancelBooking: (id) =>
    fetchAPI(`admin/bookings/${id}/cancel`, { method: "PATCH" }),

  // Helpers

  uploadImage: (formData) => {
    if (!HAS_API_BASE_URL) {
      return Promise.resolve({
        success: false,
        message: "API base URL is not configured.",
      });
    }

    const token = getToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    headers["X-App-Locale"] = (
      i18n.language ||
      navigator.language ||
      "en"
    ).slice(0, 2);
    headers["Accept-Language"] = headers["X-App-Locale"];
    return fetch(buildApiUrl("/admin/grounds"), {
      method: "POST",
      credentials: "include",
      headers: headers,
      body: formData,
    }).then((res) => res.json());
  },

  // Staff endpoints
  getStaffDashboard: () => fetchAPI("staff/dashboard"),
  getStaffStats: () => fetchAPI("staff/stats"),
  getStaffBookings: (page = 1) => fetchAPI(`staff/bookings?page=${page}`),
  getStaffBooking: (id) => fetchAPI(`staff/booking/${id}`),

  // Admin Dashboard
  getAdminStats: () => fetchAPI("admin/stats"),

  // Admin staff management
  getAdminStaffList: (page = 1) => fetchAPI(`admin/staff?page=${page}`),
  createStaff: (data) =>
    fetchAPI("admin/staff", { method: "POST", body: JSON.stringify(data) }),
  deleteStaff: (id) => fetchAPI(`admin/staff/${id}`, { method: "DELETE" }),
  getGroundsList: () => fetchAPI("admin/grounds-list"),
};
