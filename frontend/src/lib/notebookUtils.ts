import axios from 'axios';
import type { Notebook } from '../types/notebook';

export const loadNotebooks = async (userEmail: string): Promise<Notebook[]> => {
  try {
    const response = await axios.get(`/api/notebooks/${encodeURIComponent(userEmail)}`);
    return response.data
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to load notebooks";
    console.error("Error loading notebooks:", error);
    throw new Error(errorMessage);
  }
};