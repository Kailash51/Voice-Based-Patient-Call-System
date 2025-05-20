import { User, Patient, Nurse } from './common';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PatientResponse extends Patient {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface NurseResponse extends Nurse {
  id: string;
  name: string;
  email: string;
  role: string;
  experience: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface RequestResponse {
  _id: string;
  id: string;  // For backward compatibility
  fullName: string;
  roomNumber: string;
  disease: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'assigned' | 'in_progress' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export interface RequestsResponse {
  success: boolean;
  data: {
    requests: RequestResponse[];
  };
}

export interface RequestFilters {
  status?: string;
  priority?: string;
  nurseId?: string;
  patientId?: string;
} 