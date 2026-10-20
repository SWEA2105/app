import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    const customError = {
      message: error.response?.data?.message || error.message || 'Unknown network error',
      status: error.response?.status,
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
