import axios, { AxiosInstance, AxiosError } from "axios";
import type { ApiResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle responses
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Notes API
  async getNotes(className?: string, subject?: string) {
    try {
      const response = await this.api.get<ApiResponse<any>>("/notes", {
        params: { className, subject },
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching notes:", error);
      return [];
    }
  }

  async getNoteById(id: string) {
    try {
      const response = await this.api.get<ApiResponse<any>>(`/notes/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching note:", error);
      return null;
    }
  }

  // Homework API
  async getHomework(status?: string) {
    try {
      const response = await this.api.get<ApiResponse<any>>("/homework", {
        params: { status },
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching homework:", error);
      return [];
    }
  }

  async submitHomework(homeworkId: string, file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await this.api.post<ApiResponse<any>>(
        `/homework/${homeworkId}/submit`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error submitting homework:", error);
      throw error;
    }
  }

  // Announcements API
  async getAnnouncements() {
    try {
      const response = await this.api.get<ApiResponse<any>>("/announcements");
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching announcements:", error);
      return [];
    }
  }

  // Tests API
  async getTests() {
    try {
      const response = await this.api.get<ApiResponse<any>>("/tests");
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching tests:", error);
      return [];
    }
  }

  async getTestById(id: string) {
    try {
      const response = await this.api.get<ApiResponse<any>>(`/tests/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching test:", error);
      return null;
    }
  }

  async submitTest(testId: string, answers: number[]) {
    try {
      const response = await this.api.post<ApiResponse<any>>(
        `/tests/${testId}/submit`,
        { answers }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error submitting test:", error);
      throw error;
    }
  }

  // Progress API
  async getProgress() {
    try {
      const response = await this.api.get<ApiResponse<any>>("/progress");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching progress:", error);
      return null;
    }
  }

  // Doubts API
  async getDoubts() {
    try {
      const response = await this.api.get<ApiResponse<any>>("/doubts");
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching doubts:", error);
      return [];
    }
  }

  async createDoubt(doubt: { title: string; description: string; subject?: string }) {
    try {
      const response = await this.api.post<ApiResponse<any>>("/doubts", doubt);
      return response.data.data;
    } catch (error) {
      console.error("Error creating doubt:", error);
      throw error;
    }
  }

  async replyToDoubt(doubtId: string, content: string) {
    try {
      const response = await this.api.post<ApiResponse<any>>(
        `/doubts/${doubtId}/reply`,
        { content }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error replying to doubt:", error);
      throw error;
    }
  }
}

export default new ApiService();
