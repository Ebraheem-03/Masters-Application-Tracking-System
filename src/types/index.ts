export type Status = 'Draft' | 'In Progress' | 'Submitted' | 'Accepted' | 'Rejected';
export type Priority = 'High' | 'Medium' | 'Low';

export interface Application {
  _id: string;
  userId: string;
  universityName: string;
  degree: string;
  priority: Priority;
  numberOfSemesters: number;
  applicationPortal: string;
  city: string;
  country: string;
  location: string;
  startingSemester: string;
  tuitionFees: number;
  livingExpenses: number;
  documentsRequired?: string[];
  status: Status;
  deadline: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Document {
  _id: string;
  userId: string;
  type: 'SOP' | 'CV' | 'Transcript' | 'LOR' | 'IELTS' | 'TOEFL' | 'GRE' | 'Portfolio' | 'Other';
  name: string;
  status: 'Draft' | 'Ready' | 'Uploaded';
  relatedApplications: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}