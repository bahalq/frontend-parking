const DEFAULT_BACKEND_BASE_URL =
  "https://bookmypitch-d9fcfzgvfrg8grf2.spaincentral-01.azurewebsites.net";

const envBackendBaseUrl =
  import.meta.env.VITE_BACKEND_BASE_URL?.trim() ||
  import.meta.env.VITE_API_HOST?.trim();

const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const BACKEND_BASE_URL = (
  envBackendBaseUrl ||
  DEFAULT_BACKEND_BASE_URL
).replace(/\/+$/, "");

export const API_BASE_URL = (
  envApiBaseUrl ||
  `${BACKEND_BASE_URL}/api`
).replace(/\/+$/, "");

export const HAS_API_BASE_URL = API_BASE_URL.length > 0;

export function buildApiUrl(path = "") {
  if (!HAS_API_BASE_URL) {
    return null;
  }

  const normalizedPath = path ? `/${path.replace(/^\/+/, "")}` : "";
  return `${API_BASE_URL}${normalizedPath}`;
}

export function buildBackendUrl(path = "") {
  const normalizedPath = path ? `/${path.replace(/^\/+/, "")}` : "";
  return `${BACKEND_BASE_URL}${normalizedPath}`;
}
