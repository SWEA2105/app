import axios from 'axios';

export const resolveApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // 1. Check for user-configured custom API URL (e.g. entered via Diagnostics on real phone)
    const customUrl = localStorage.getItem('academic_custom_api_url');
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/+$/, '');
    }

    // 2. Detect Capacitor iOS & Android WebView contexts
    const isNative = Boolean(
      window.Capacitor?.isNativePlatform?.() ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'ionic:'
    );

    if (isNative) {
      // If VITE_API_URL is configured to a remote server/IP (not localhost), honor it
      const envUrl = import.meta.env.VITE_API_URL;
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl.replace(/\/+$/, '');
      }

      // Detect Android Emulator vs iOS Simulator / physical device
      const isAndroid = /android/i.test(navigator.userAgent) || window.Capacitor?.getPlatform?.() === 'android';
      if (isAndroid) {
        // Standard Android emulator loopback to host PC
        return 'http://10.0.2.2:8000';
      }

      // iOS Simulator or default native
      return 'http://localhost:8000';
    }

    // 3. Web browser context: Use VITE_API_URL if configured, otherwise fallback to localhost
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
    }

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://127.0.0.1:8000';
    }
  }

  return import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
};

export const API_BASE_URL = resolveApiBaseUrl();

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getActiveApiBaseUrl = () => {
  return apiClient.defaults.baseURL.replace(/\/api$/, '');
};

export const setCustomApiBaseUrl = (newUrl) => {
  if (typeof window !== 'undefined') {
    if (newUrl && newUrl.trim()) {
      const cleanUrl = newUrl.trim().replace(/\/+$/, '');
      localStorage.setItem('academic_custom_api_url', cleanUrl);
      apiClient.defaults.baseURL = `${cleanUrl}/api`;
      return cleanUrl;
    } else {
      localStorage.removeItem('academic_custom_api_url');
      const resetUrl = resolveApiBaseUrl();
      apiClient.defaults.baseURL = `${resetUrl}/api`;
      return resetUrl;
    }
  }
  return resolveApiBaseUrl();
};


// Request interceptor to attach bearer token if present
apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('academic_analyzer_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // Ignore storage errors in restricted contexts
  }
  return config;
});

// Response interceptor for consistent response unwrapping
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let fallbackMsg = 'Unknown network error';
    if (!error.response) {
      fallbackMsg = 'Server unreachable. Verify your backend or mobile network connection.';
    }
    const customError = {
      message: error.response?.data?.message || error.message || fallbackMsg,
      status: error.response?.status || (error.code === 'ECONNABORTED' ? 408 : 0),
      details: error.response?.data?.data || null,
    };
    return Promise.reject(customError);
  }
);

export const healthApi = {
  getHealth: async () => apiClient.get('/health'),
  ping: async () => apiClient.get('/health/ping'),
};

export const authApi = {
  login: async (email, role = 'faculty') => 
    apiClient.post('/auth/login', { email, role }),
  demoLogin: async (role = 'faculty') => 
    apiClient.post(`/auth/demo-login/${role}`),
  getMe: async () => 
    apiClient.get('/auth/me'),
  // Student sign-in: register number + e-mail ID -> OTP -> signed JWT
  requestStudentOtp: async (regNo, email) =>
    apiClient.post('/auth/student/otp/request', { regNo, email }),
  verifyStudentOtp: async (payload) =>
    apiClient.post('/auth/student/otp/verify', payload),
};

export const studentsApi = {
  listStudents: async (params = {}) => 
    apiClient.get('/students', { params }),
  getStudent: async (id) => 
    apiClient.get(`/students/${id}`),
  getStudentDossier: async (id) => 
    apiClient.get(`/students/${id}/dossier`),
  createStudent: async (data) => 
    apiClient.post('/students', data),
  updateStudent: async (id, data) => 
    apiClient.put(`/students/${id}`, data),
};

export const iaApi = {
  getSubjectAnalytics: async (subjectCode, department = 'CSE') => 
    apiClient.get(`/ia-marks/analytics/${subjectCode}`, { params: { department } }),
  updateSingleMark: async (studentId, subjectCode, iaType, mark) => 
    apiClient.post('/ia-marks/update', { studentId, subjectCode, iaType, mark }),
  uploadMarksFile: async (formData, subjectCode, department = 'CSE') => 
    apiClient.post(`/ia-marks/upload-file?subject_code=${subjectCode}&department=${department}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const universityApi = {
  listResults: async (params = {}) => 
    apiClient.get('/university-results', { params }),
  getAnalytics: async (semester = 5) => 
    apiClient.get('/university-results/analytics', { params: { semester } }),
  extractPdf: async (formData) => 
    apiClient.post('/university-results/extract-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  commitResults: async (records) => 
    apiClient.post('/university-results/commit', { records }),
};

export const arrearsApi = {
  listArrears: async (params = {}) => 
    apiClient.get('/arrears', { params }),
  getClassifiedStudents: async (params = {}) =>
    apiClient.get('/arrears/classified-students', { params }),
  getKpis: async (department = 'CSE') => 
    apiClient.get('/arrears/kpis', { params: { department } }),
  clearArrear: async (regNo, subjectCode, clearedSession = 'Nov/Dec 2024') => 
    apiClient.post('/arrears/clear', { regNo, subjectCode, clearedSession }),
};

export const reportsApi = {
  getCatalog: async () => 
    apiClient.get('/reports/catalog'),
  getDownloadUrl: (reportType, department = 'CSE', subjectCode = 'CS3591') => 
    `${API_BASE_URL}/api/reports/download/${reportType}?department=${department}&subject_code=${subjectCode}`,
};

export default apiClient;
