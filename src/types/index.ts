export type Status =
  | 'PLANNING' | 'ELIGIBLE' | 'APPLIED' | 'SUBMITTED' | 'INTERVIEW' | 'OFFER' | 'WAITLISTED' | 'REJECTED';

export interface University {
  _id: string;
  name: string;
  country?: string;
  city?: string;
  website?: string;
}

export interface Program {
  _id: string;
  universityId: string;
  degree: 'MS' | 'MSc' | 'MEng' | 'MA' | 'MBA' | 'Other';
  title: string;
  term: 'Fall' | 'Spring' | 'Summer' | 'Winter';
  year: number;
  mode?: 'On-campus' | 'Online' | 'Hybrid';
}

export interface Requirement {
  key: string;
  label: string;
  required: boolean;
  completed: boolean;
  note?: string;
}

export interface Deadline {
  label: string;
  date: string;
  type: 'Priority' | 'Final' | 'Scholarship' | 'Interview' | 'Other';
}

export interface Application {
  _id: string;
  userId: string;
  university: University;
  program: Program;
  status: Status;
  priority?: 'Low' | 'Medium' | 'High';
  deadlines: Deadline[];
  links?: {
    official?: string;
    apply?: string;
    portal?: string;
    checklist?: string;
  };
  contacts?: {
    name?: string;
    email?: string;
  }[];
  eligibility?: {
    gpa?: string;
    language?: string;
    tests?: string[];
    notes?: string;
  };
  fees?: {
    application?: number;
    tuitionAnnual?: number;
    currency?: string;
    waiverEligible?: boolean;
  };
  requirements: Requirement[];
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