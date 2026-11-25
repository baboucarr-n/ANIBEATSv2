import type { WeeklyMustItem, WeeklyMustMood, WeeklyMustTag } from '../utils/youtube';

export interface WeeklyMustPayload {
  title: string;
  creator: string;
  youtubeUrl: string;
  whyThisWeek: string;
  tag: WeeklyMustTag;
  moodTag: WeeklyMustMood;
  weekLabel: string;
  isCurrent: boolean;
}

// Defaults to same-origin /api (served by Express live on port 3000)
// Set VITE_API_BASE=http://localhost:8080/api/anibeats to derive Spring Boot root http://localhost:8080/api
const RAW_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/+$/, '') || '';
const API_ROOT = RAW_BASE.endsWith('/anibeats')
  ? RAW_BASE.slice(0, -'/anibeats'.length)
  : RAW_BASE || '/api';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_ROOT}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    let message = `API ${res.status}: ${res.statusText}`;
    try {
      const errBody = (await res.json()) as { error?: string; message?: string };
      if (errBody?.error || errBody?.message) {
        message = errBody.error || errBody.message || message;
      }
    } catch {
      // ignore non-json error body
    }
    throw new Error(message);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export const weeklyMustApi = {
  getCurrent: () => requestJson<WeeklyMustItem | null>('/weekly-must/current'),
  getArchive: () => requestJson<WeeklyMustItem[]>('/weekly-must/archive'),
  getById: (id: number) => requestJson<WeeklyMustItem>(`/weekly-must/${id}`),
  create: (payload: WeeklyMustPayload) =>
    requestJson<WeeklyMustItem>('/admin/weekly-must', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: WeeklyMustPayload) =>
    requestJson<WeeklyMustItem>(`/admin/weekly-must/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  delete: (id: number) =>
    requestJson<void>(`/admin/weekly-must/${id}`, {
      method: 'DELETE',
    }),
  setCurrent: (id: number) =>
    requestJson<WeeklyMustItem>(`/admin/weekly-must/${id}/set-current`, {
      method: 'POST',
    }),
};
