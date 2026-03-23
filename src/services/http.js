import { buildApiUrl } from "../config/api";

let runtimeAuthToken = process.env.EXPO_PUBLIC_API_TOKEN || "";

export function setAuthToken(token) {
  runtimeAuthToken = token || "";
}

export function getAuthToken() {
  return runtimeAuthToken;
}

export async function fetchJson(path, options = {}) {
  const authToken = getAuthToken();
  const response = await fetch(buildApiUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await safeReadError(response);
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function safeReadError(response) {
  try {
    const payload = await response.json();
    return payload?.message || payload?.error || "";
  } catch {
    try {
      return await response.text();
    } catch {
      return "";
    }
  }
}
