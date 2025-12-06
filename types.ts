export type UserRole = 'receptionist' | 'doctor' | 'pharmacist' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  address: string;
  notes?: string;
  createdAt: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string; // Denormalized for easier display
  doctorId: string;
  date: string; // ISO Date string YYYY-MM-DD
  time: string; // HH:mm
  description: string;
  status: AppointmentStatus;
  consultationFee?: number;
  paymentStatus?: 'pending' | 'paid';
}

export interface Medicine {
  name: string;
  dosage: string; // e.g., "1 tab"
  frequency: string; // e.g., "3 times a day"
  duration: string; // e.g., "5 days"
}

export interface EyeMeasurement {
  sph: string;
  cyl: string;
  axis: string;
  vision: string;
  notes?: string;
}

export interface EyeAddition {
  both_eyes?: string;
  right_eye?: string;
  left_eye?: string;
}

export interface EyePrescriptionDetails {
  patient_name?: string; // Can be derived from patientName in main Prescription
  date?: string; // Can be derived from date in main Prescription
  right_eye: EyeMeasurement;
  left_eye: EyeMeasurement;
  addition?: EyeAddition;
  advice?: string;
  next_visit?: string; // e.g., "1 Month", "3 Months"
  ipd?: string; // Pupillary Distance
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  medicines: Medicine[];
  instructions: string;
  date: string; // ISO string
  eyePrescription?: EyePrescriptionDetails; // New optional field for eye exam details
}

export type OrderStatus = 'pending' | 'processing' | 'fulfilled';

export interface PharmacyOrder {
  id: string;
  prescriptionId: string;
  patientName: string;
  doctorName: string;
  status: OrderStatus;
  totalCost: number;
  fulfilledAt?: string;
  notes?: string;
}

export interface ClinicContextType {
  currentUser: User | null;
  patients: Patient[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  pharmacyOrders: PharmacyOrder[];
  login: (role: UserRole) => void;
  logout: () => void;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => void;
  bookAppointment: (appt: Omit<Appointment, 'id' | 'status'>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  createPrescription: (prescription: Omit<Prescription, 'id' | 'date'>) => void;
  updateOrderStatus: (id: string, status: OrderStatus, cost?: number) => void;
}