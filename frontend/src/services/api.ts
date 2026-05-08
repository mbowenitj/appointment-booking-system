import axios from 'axios';
import { Branch, SlotInfo, Booking } from '../types';

// In development, requests go to /api which Vite proxies to localhost:3001.
const baseURL = import.meta.env.VITE_API_URL ?? '/api';
const api = axios.create({ baseURL });

export const fetchBranches = (): Promise<Branch[]> =>
  api.get<Branch[]>('/branches').then((r) => r.data);

export const fetchSlots = (branchId: string, date: string): Promise<SlotInfo[]> =>
  api.get<SlotInfo[]>('/slots', { params: { branchId, date } }).then((r) => r.data);

export const createBooking = (payload: {
  branchId: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}): Promise<Booking> => api.post<Booking>('/bookings', payload).then((r) => r.data);
