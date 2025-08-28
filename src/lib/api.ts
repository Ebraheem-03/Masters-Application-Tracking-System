import type { Application, User, Document } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Mock mode when no API URL is provided
const isMockMode = !API_BASE_URL;

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (isMockMode) {
      // Return mock data for demo purposes
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      throw new Error('Mock mode - API not implemented yet');
    }

    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async logout(): Promise<void> {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async refreshToken(): Promise<{ token: string }> {
    return this.request('/auth/refresh', { method: 'POST' });
  }

  // Applications endpoints
  async getApplications(): Promise<Application[]> {
    return this.request('/applications');
  }

  async createApplication(application: Omit<Application, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Application> {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  }

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application> {
    return this.request(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteApplication(id: string): Promise<void> {
    return this.request(`/applications/${id}`, { method: 'DELETE' });
  }

  // Documents endpoints
  async getDocuments(): Promise<Document[]> {
    return this.request('/documents');
  }

  async createDocument(document: Omit<Document, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(document),
    });
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    return this.request(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteDocument(id: string): Promise<void> {
    return this.request(`/documents/${id}`, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();