// api.ts

const API_BASE_URL = 'http://localhost:3001'; // Assuming your backend runs on port 3001

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function callApi<T>(endpoint: string, method: string, data?: any): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    if (response.ok) {
      return { success: true, data: result };
    } else {
      return { success: false, error: result.message || 'An error occurred' };
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
}

export const authApi = {
  login: (credentials: any) => callApi('/auth/login', 'POST', credentials),
  register: (userData: any) => callApi('/auth/register', 'POST', userData),
};

export const adminApi = {
  getUsers: () => callApi('/admin/users', 'GET'),
  updateUser: (userId: string, userData: any) => callApi(`/admin/users/${userId}`, 'PUT', userData),
  deleteUser: (userId: string) => callApi(`/admin/users/${userId}`, 'DELETE'),
};

export const staffApi = {
  getQueue: () => callApi('/staff/queue', 'GET'),
  updateQueueItem: (itemId: string, status: string) => callApi(`/staff/queue/${itemId}`, 'PUT', { status }),
};