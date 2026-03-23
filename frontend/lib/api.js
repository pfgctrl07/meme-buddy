"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export function getToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("meme-buddy-token") || "";
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem("meme-buddy-token", token);
  } else {
    window.localStorage.removeItem("meme-buddy-token");
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    throw new Error("API unreachable. Check the backend URL, CORS settings, and whether Render is awake.");
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
}
