// src/lib/api/http-client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { CommonApiResponse, Pagination } from '../types'; // Import CommonApiResponse and Pagination

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding authorization token
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = (config as any)._token;

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling API's custom success/error structure
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<CommonApiResponse<any>>) => { // Type the response data
    const responseData = response.data;

    // Special handling for 404 responses from specific endpoints
    if (response.status === 404 && response.config.url &&
        (response.config.url.includes('/projects/') || response.config.url.includes('/tasks/') ||
         response.config.url.includes('/documents/') || response.config.url.includes('/invoices/'))) {

      const emptyPagination: Pagination = { current: 1, total: 0, count: 0, totalRecords: 0 };
      let emptyData: any = {}; // Default to empty object for data property

      if (response.config.url.includes('/projects/')) emptyData = { projects: [] };
      else if (response.config.url.includes('/tasks/')) emptyData = { tasks: [] };
      else if (response.config.url.includes('/documents/')) emptyData = { documents: [] };
      else if (response.config.url.includes('/invoices/')) emptyData = { invoice: [] };

      // Return a CommonApiResponse structure for 404s
      return {
        ...response,
        data: {
          success: true, // Treat as success for "no data found" scenarios in lists
          code: 404,
          message: "No data found.",
          data: emptyData,
          pagination: emptyPagination,
        }
      };
    }

    if (responseData.success === false) {
      // Reject with an error if the API explicitly indicates failure
      return Promise.reject(new Error(responseData.message || "API returned a non-successful response."));
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const errorData = error.response.data as CommonApiResponse<any>;
      // If the API response already conforms to CommonApiResponse, use its message
      return Promise.reject(new Error(errorData?.message || `API request failed with status ${error.response.status}`));
    }
    return Promise.reject(error);
  }
);

interface HttpClientOptions extends AxiosRequestConfig {
  token?: string;
  isFormData?: boolean;
}

export async function httpClient<T>(
  endpoint: string,
  options?: HttpClientOptions
): Promise<CommonApiResponse<T>> { // httpClient now returns CommonApiResponse<T>
  const { token, isFormData, data, ...customConfig } = options || {};

  const config: AxiosRequestConfig = {
    url: endpoint,
    method: options?.method || 'GET',
    data: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    headers: {
      ...options?.headers,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    },
    ...customConfig,
    _token: token,
  };

  try {
    // AxiosResponse<CommonApiResponse<T>> is the expected outer type
    const response = await axiosInstance.request<any, AxiosResponse<CommonApiResponse<T>>>(config);
    return response.data; // Return the entire CommonApiResponse
  } catch (error) {
    console.error(`Error in httpClient for ${endpoint}:`, error);
    throw error instanceof Error ? error : new Error("An unknown error occurred with the API request.");
  }
}

export { axiosInstance };