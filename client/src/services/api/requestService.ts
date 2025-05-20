import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { RequestResponse } from '@/types/api';

class RequestService {
  private async getHeaders() {
    const token = await AsyncStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async createRequest(data: any) {
    try {
      const headers = await this.getHeaders();
      console.log('Making request with data:', data);
      
      const response = await axios.post(`${API_URL}/api/requests`, data, { headers });
      return response;
    } catch (error: any) {
      console.error('Request service error:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit request');
    }
  }

  async getRequests() {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${API_URL}/api/requests`, { headers });
      return {
        data: {
          requests: response.data.data // Adjust to match the server response structure
        }
      };
    } catch (error) {
      console.error('Error fetching requests:', error);
      throw error;
    }
  }

  async updateRequestStatus(requestId: string, status: string) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.put(
        `${API_URL}/api/requests/${requestId}/status`,
        { status },
        { headers }
      );
      return {
        success: true,
        data: response.data.data as RequestResponse
      };
    } catch (error: any) {
      console.error('Error updating request status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update request status');
    }
  }

  async assignRequest(requestId: string, nurseId: string) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.put(
        `${API_URL}/api/requests/${requestId}/assign`,
        { nurseId },
        { headers }
      );
      return response;
    } catch (error: any) {
      console.error('Error assigning request:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign request');
    }
  }
}

export const requestService = new RequestService();
