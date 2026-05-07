export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface SlotInfo {
  time: string;
  available: boolean;
}

export interface Booking {
  id: string;
  branchId: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'confirmed';
  createdAt: string;
  emailPreviewUrl: string | null;
}

export interface BookingConfirmation extends Booking {
  branchName: string;
}

export interface CustomerDetails {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface FieldErrors {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}
