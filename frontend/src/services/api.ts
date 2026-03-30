const API_BASE_URL = 'https://autoescalation-framework-production.up.railway.app/api';

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'resolved';
  productTeam: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  slaMinutes: number;
  assignedTo?: string;
  tags?: string[];
}

export interface ReportIssuePayload {
  productTeam: string;
  description: string;
  files?: File[];
}

export const apiService = {
  async getIssues(): Promise<Issue[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/issues`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch issues');
      return await response.json();
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }
  },

  async getIssue(id: string): Promise<Issue> {
    try {
      const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch issue');
      return await response.json();
    } catch (error) {
      console.error('Error fetching issue:', error);
      throw error;
    }
  },

  async reportIssue(payload: ReportIssuePayload): Promise<Issue> {
    try {
      const formData = new FormData();
      formData.append('productTeam', payload.productTeam);
      formData.append('description', payload.description);
      
      if (payload.files) {
        payload.files.forEach((file) => {
          formData.append('files', file);
        });
      }

      const response = await fetch(`${API_BASE_URL}/issues`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to report issue');
      return await response.json();
    } catch (error) {
      console.error('Error reporting issue:', error);
      throw error;
    }
  },

  async updateIssueStatus(id: string, status: string): Promise<Issue> {
    try {
      const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update issue');
      return await response.json();
    } catch (error) {
      console.error('Error updating issue:', error);
      throw error;
    }
  },
};
