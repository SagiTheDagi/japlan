import type { Plan } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const api = {
  // Plans
  async createPlan(plan: Plan): Promise<Plan> {
    const response = await fetch(`${API_BASE_URL}/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plan),
    });

    if (!response.ok) {
      throw new Error(`Failed to create plan: ${response.statusText}`);
    }

    return response.json();
  },

  async getPlan(id: string): Promise<Plan> {
    const response = await fetch(`${API_BASE_URL}/plans/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to get plan: ${response.statusText}`);
    }

    return response.json();
  },

  async updatePlan(id: string, plan: Plan): Promise<Plan> {
    const response = await fetch(`${API_BASE_URL}/plans/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plan),
    });

    if (!response.ok) {
      throw new Error(`Failed to update plan: ${response.statusText}`);
    }

    return response.json();
  },

  async deletePlan(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/plans/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete plan: ${response.statusText}`);
    }
  },

  async getPlansByUser(userId: string): Promise<Plan[]> {
    const response = await fetch(`${API_BASE_URL}/plans/user/${userId}`);

    if (!response.ok) {
      throw new Error(`Failed to get user plans: ${response.statusText}`);
    }

    return response.json();
  },
};

