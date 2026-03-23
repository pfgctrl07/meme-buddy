const rawBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");
export const USE_MOCK_API = API_BASE_URL.length === 0;

export function buildApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
