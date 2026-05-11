import { API_BASE } from "../config/api";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23e5e7eb'/%3E%3Cpath d='M0 470 L210 320 L360 420 L520 250 L800 470 L800 600 L0 600 Z' fill='%23cbd5e1'/%3E%3Ccircle cx='235' cy='175' r='58' fill='%23f8fafc'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' fill='%2364748b' font-family='Arial, sans-serif' font-size='30'%3EImage unavailable%3C/text%3E%3C/svg%3E";

export const resolveMediaUrl = (value) => {
  if (!value) {
    return PLACEHOLDER_IMAGE;
  }

  const trimmed = String(value).trim();

  if (/^(https?:\/\/|data:image\/)/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/uploads/")) {
    return `${API_BASE}${trimmed}`;
  }

  if (trimmed.startsWith("uploads/")) {
    return `${API_BASE}/${trimmed}`;
  }

  if (/^\/?api\/upload\//i.test(trimmed)) {
    return `${API_BASE}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return PLACEHOLDER_IMAGE;
};
