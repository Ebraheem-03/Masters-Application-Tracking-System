import { create } from 'zustand';
import type { Application } from '@/types';
import { api } from '@/lib/api';

// Development mode flag
const isDevelopment = import.meta.env.DEV;
const useFallbackMode = isDevelopment && !import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_BASE_URL;

// Mock applications for development
const mockApplications: Application[] = [
  {
    _id: '1',
    userId: 'user1',
    universityName: 'Stanford University',
    degree: 'Master of Science in Computer Science',
    priority: 'High',
    numberOfSemesters: 4,
    applicationPortal: 'https://gradadmissions.stanford.edu',
    city: 'Stanford',
    country: 'United States',
    location: 'Main Campus',
    startingSemester: 'Fall 2025',
    tuitionFees: 58416,
    livingExpenses: 25000,
    documentsRequired: ['Statement of Purpose', 'CV', 'Transcripts', 'Letters of Recommendation'],
    status: 'Draft',
    deadline: '2024-12-15',
    notes: 'Top choice program with excellent AI/ML research opportunities.',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-10T14:30:00Z'
  },
  {
    _id: '2',
    userId: 'user1',
    universityName: 'MIT',
    degree: 'Master of Engineering in Electrical Engineering',
    priority: 'High',
    numberOfSemesters: 3,
    applicationPortal: 'https://gradadmissions.mit.edu',
    city: 'Cambridge',
    country: 'United States',
    location: 'Main Campus',
    startingSemester: 'Fall 2025',
    tuitionFees: 57986,
    livingExpenses: 20000,
    documentsRequired: ['Statement of Purpose', 'CV', 'Transcripts'],
    status: 'In Progress',
    deadline: '2024-12-01',
    notes: 'Strong engineering program.',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-02-15T14:30:00Z'
  },
  {
    _id: '3',
    userId: 'user1',
    universityName: 'University of Toronto',
    degree: 'Master of Applied Science in Computer Engineering',
    priority: 'Medium',
    numberOfSemesters: 4,
    applicationPortal: 'https://www.sgs.utoronto.ca',
    city: 'Toronto',
    country: 'Canada',
    location: 'St. George Campus',
    startingSemester: 'Fall 2025',
    tuitionFees: 32000,
    livingExpenses: 18000,
    documentsRequired: ['Statement of Purpose', 'CV'],
    status: 'Submitted',
    deadline: '2024-11-30',
    notes: 'Good backup option with reasonable tuition.',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-02-20T14:30:00Z'
  }
];

interface ApplicationsState {
  applications: Application[];
  isLoading: boolean;
  error: string | null;
  filters: {
    priority?: string;
    status?: string;
    country?: string;
    startingSemester?: string;
    sortBy: string;
    sortOrder: string;
  };
  setFilters: (filters: Partial<ApplicationsState['filters']>) => void;
  fetchApplications: () => Promise<void>;
  addApplication: (application: Omit<Application, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateApplication: (id: string, updates: Partial<Application>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  applications: [],
  isLoading: false,
  error: null,
  filters: {
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    // Automatically fetch applications when filters change
    get().fetchApplications();
  },

  fetchApplications: async () => {
    try {
      set({ isLoading: true, error: null });
      
      if (useFallbackMode) {
        // Use mock data in development mode without backend
        console.log('Using fallback mode with mock data');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        set({
          applications: mockApplications,
          isLoading: false,
          error: null,
        });
        return;
      }
      
      const response = await api.applications.getAll(get().filters);
      
      set({
        applications: response.data.applications,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Fetch applications error:', error);
      
      // If it's a network error and we're in development, fall back to mock data
      if (isDevelopment && error instanceof Error && error.message.includes('Unable to connect to server')) {
        console.log('Backend unavailable, falling back to mock data');
        set({
          applications: mockApplications,
          isLoading: false,
          error: null,
        });
        return;
      }
      
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch applications',
      });
    }
  },

  addApplication: async (application) => {
    try {
      set({ isLoading: true, error: null });
      
      if (useFallbackMode) {
        // Simulate adding application in development mode
        console.log('Adding application in fallback mode');
        await new Promise(resolve => setTimeout(resolve, 500));
        const newApp: Application = {
          ...application,
          _id: Date.now().toString(),
          userId: 'user1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          applications: [newApp, ...state.applications],
          isLoading: false,
          error: null,
        }));
        return;
      }
      
      const response = await api.applications.create(application);
      
      set((state) => ({
        applications: [response.data.application, ...state.applications],
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Add application error:', error);
      
      // If it's a network error and we're in development, use fallback
      if (isDevelopment && error instanceof Error && error.message.includes('Unable to connect to server')) {
        console.log('Backend unavailable, simulating add operation');
        const newApp: Application = {
          ...application,
          _id: Date.now().toString(),
          userId: 'user1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          applications: [newApp, ...state.applications],
          isLoading: false,
          error: null,
        }));
        return;
      }
      
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create application',
      });
      throw error;
    }
  },

  updateApplication: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      if (useFallbackMode) {
        // Simulate updating application in development mode
        console.log('Updating application in fallback mode');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set((state) => ({
          applications: state.applications.map((app) =>
            app._id === id 
              ? { ...app, ...updates, updatedAt: new Date().toISOString() }
              : app
          ),
          isLoading: false,
          error: null,
        }));
        return;
      }
      
      const response = await api.applications.update(id, updates);
      
      set((state) => ({
        applications: state.applications.map((app) =>
          app._id === id ? response.data.application : app
        ),
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Update application error:', error);
      
      // If it's a network error and we're in development, use fallback
      if (isDevelopment && error instanceof Error && error.message.includes('Unable to connect to server')) {
        console.log('Backend unavailable, simulating update operation');
        set((state) => ({
          applications: state.applications.map((app) =>
            app._id === id 
              ? { ...app, ...updates, updatedAt: new Date().toISOString() }
              : app
          ),
          isLoading: false,
          error: null,
        }));
        return;
      }
      
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update application',
      });
      throw error;
    }
  },

  deleteApplication: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      if (useFallbackMode) {
        // Simulate deleting application in development mode
        console.log('Deleting application in fallback mode');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set((state) => ({
          applications: state.applications.filter((app) => app._id !== id),
          isLoading: false,
          error: null,
        }));
        return;
      }
      
      await api.applications.delete(id);
      
      set((state) => ({
        applications: state.applications.filter((app) => app._id !== id),
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Delete application error:', error);
      
      // If it's a network error and we're in development, use fallback
      if (isDevelopment && error instanceof Error && error.message.includes('Unable to connect to server')) {
        console.log('Backend unavailable, simulating delete operation');
        set((state) => ({
          applications: state.applications.filter((app) => app._id !== id),
          isLoading: false,
          error: null,
        }));
        return;
      }
      
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete application',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));