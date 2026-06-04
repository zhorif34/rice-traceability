import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const user = localStorage.getItem('ambapari_user');
  if (user) {
    try {
      const { token } = JSON.parse(user);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch { /* corrupted localStorage entry */ }
  }
  return config;
});

export interface ReportData {
  batchId: string;
  jenis: string;
  entitas: string;
  nama: string;
  lokasi: string;
  tanggal: string;
  deskripsi: string;
  prioritas: string;
}

export interface Report {
  reportId: string;
  batchId: string;
  pelapor: string;
  entitas: string;
  jenis: string;
  status: string;
  prioritas: string;
  lokasi: string;
  tanggal: string;
  deskripsi: string;
  creator_id: string;
  verified: boolean;
  suspect: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportStats {
  total: number;
  diproses: number;
  prioritas: number;
  fraud: number;
  verified: number;
}

export const reportApi = {
  create: (data: ReportData) =>
    api.post<Report>('/report', data).then(r => r.data),

  getAll: (params?: { status?: string; search?: string }) =>
    api.get<Report[]>('/report', { params }).then(r => r.data),

  getStats: () =>
    api.get<ReportStats>('/report/stats').then(r => r.data),

  getById: (reportId: string) =>
    api.get<Report>(`/report/${reportId}`).then(r => r.data),

  updateStatus: (reportId: string, status: string, prioritas?: string) =>
    api.put<Report>(`/report/${reportId}/status`, { status, prioritas }).then(r => r.data),
};

export const reportPublicApi = {
  create: (data: { nama: string; email?: string; batchId?: string; jenis: string; entitas?: string; lokasi?: string; tanggal?: string; deskripsi: string }) =>
    api.post<Report>('/report-public', data).then(r => r.data),
};

export default api;
