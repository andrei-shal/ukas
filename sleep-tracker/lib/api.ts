import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export const authApi = {
  signup: (data: { username: string; password: string }) =>
    api.post('/auth/signup', data),
  signin: (data: { username: string; password: string }) =>
    api.post('/auth/signin', data),
  signout: () => api.post('/auth/signout'),
  status: () => api.get('/auth/status'),
};

export const entryApi = {
  getEntries: () => api.get('/entry/entries'),
  addEntry: (data: { start: Date; end: Date; rate: number; notes: string }) =>
    api.post<{ entryId: string }>('/entry/add', data),
  deleteEntry: (id: string) => api.post('/entry/delete', { entryId: id }),
};

export const analyticsApi = {
  getNotes: (entryId: string) => 
    api.post<{ data: string }>('/analytics/notes', { entryId }),
  getNotesForAll: () => api.get<{ data: string }>('/analytics/forall')
};