import { create } from 'zustand';
import type { Application } from '@/types';
import { mockApplications } from '@/lib/mock-data';

interface ApplicationsState {
  applications: Application[];
  setApplications: (applications: Application[]) => void;
  addApplication: (application: Application) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
}

export const useApplicationsStore = create<ApplicationsState>((set) => ({
  applications: mockApplications,
  setApplications: (applications) => set({ applications }),
  addApplication: (application) =>
    set((state) => ({ applications: [application, ...state.applications] })),
  updateApplication: (id, updates) =>
    set((state) => ({
      applications: state.applications.map((app) =>
        app._id === id ? { ...app, ...updates } : app
      ),
    })),
  deleteApplication: (id) =>
    set((state) => ({
      applications: state.applications.filter((app) => app._id !== id),
    })),
}));