import axios from 'axios';

export const SERVER_IP = '192.168.8.167';
export const SERVER_PORT = '8000'; // Replace with your actual port number if different

const api = axios.create({
    baseURL: `http://${SERVER_IP}:${SERVER_PORT}`,
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Fetch all advertisements
export const fetchAdvertisements = async (): Promise<any> => {
    try {
        console.log(`Attempting to fetch from: ${api.defaults.baseURL}/api/advertisements`);
        const response = await api.get('/api/advertisements');
        console.log('Response received:', response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', error.message);
            console.error('Error details:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error config:', error.config);
            if (error.request) {
                console.error('Request was made but no response was received');
            }
        } else {
            console.error('Unexpected error:', error);
        }
        throw error;
    }
};


// Test connection
export const testConnection = async (): Promise<void> => {
    try {
        const response = await api.get('/');
        console.log('Connection successful:', response.data);
    } catch (error) {
        console.error('Connection test failed:', error);
    }
};


export const updateAdvertisement = async (id: string, data: Partial<Advertisement>): Promise<any> => {
    try {
      const response = await api.put(`/api/advertisements/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating advertisement:', error);
      throw error;
    }
  };
  
  export const deleteAdvertisement = async (id: string, uniqueCode: string): Promise<any> => {
    try {
      const response = await api.delete(`/api/advertisements/delete/${id}`, {
        data: { uniqueCode }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      throw error;
    }
  };