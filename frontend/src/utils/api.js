import axios from 'axios';

// ✅ BASE URL handling
export const BASE_URL =
    import.meta.env.VITE_API_URL ||
    (["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "http://localhost:5000"
        : window.location.origin);

// ✅ Standardize Photo URL construction
export const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    const normalizedPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
    return `${BASE_URL}${normalizedPath}`;
};

const API_URL = `${BASE_URL}/api`;

// ✅ Create Axios Instance
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for cookies (refreshToken)
});

// ✅ Migration Safety: move old localStorage tokens to sessionStorage
if (localStorage.getItem("accessToken")) {
    sessionStorage.setItem("accessToken", localStorage.getItem("accessToken"));
    localStorage.removeItem("accessToken");
}

// ✅ Ensure Authorization is sent on every request if token exists
// (Requested Fix: 1. FRONTEND TOKEN SENDING)
if (sessionStorage.getItem("accessToken")) {
    api.defaults.headers.common["Authorization"] = "Bearer " + sessionStorage.getItem("accessToken");
}

// ✅ Request Interceptor: Attach Access Token
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Response Interceptor: Handle Token Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Only attempt refresh if we had a tab session active.
            // This prevents a new tab from implicitly logging in using a stale refresh cookie
            // when the user wants strict tab-closure session invalidation.
            if (!sessionStorage.getItem('accessToken') && originalRequest.url !== '/auth/login') {
                return Promise.reject(error);
            }

            try {
                // Attempt to refresh token
                const { data } = await axios.post(
                    `${API_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                    if (data.success && data.accessToken) {
                        // Store new token
                        sessionStorage.setItem('accessToken', data.accessToken); 

                        // Update header for original request
                        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

                        // Update header for future requests (optional but good)
                        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    // Clear storage and optionally redirect
                    sessionStorage.removeItem('accessToken');
                    // You might trigger a logout action here if you had access to the store/context
                    window.location.href = '/login';
                }
            }

        return Promise.reject(error);
    }
);




// ✅ USERS
export const usersAPI = {
    getPending: () => api.get('/users/pending').then(res => res.data),
    getPendingCount: () => api.get('/users/pending/count').then(res => res.data),
    approve: (id, action) => api.patch(`/users/approve/${id}`, { action }).then(res => res.data),
    getByRole: (role) => api.get(`/users/role/${role}`).then(res => res.data),
    get: (id) => api.get(`/users/${id}`).then(res => res.data),
    create: (data) => api.post('/users', data).then(res => res.data),
    update: (id, data) => api.put(`/users/${id}`, data).then(res => res.data),
    delete: (id) => api.delete(`/users/${id}`).then(res => res.data),

    // Profile Updates
    updateProfile: (id, formData) => api.put(`/users/${id}`, formData).then(res => res.data),

    changePassword: (data) => api.put('/users/change-password', data).then(res => res.data),
};


// ✅ DASHBOARD
export const dashboardAPI = {
    getAdmin: () => api.get('/dashboard/admin').then(res => res.data),
    getStats: () => api.get('/admin/dashboard/stats').then(res => res.data),
};

// ✅ ADMIN MANAGEMENT
export const adminAPI = {
    getProjects: () => api.get('/admin/projects').then(res => res.data),
    createPaymentRequest: (data) => api.post('/payment/request', data).then(res => res.data), // ADDED
    assignManager: (projectId, managerId) => api.patch(`/admin/projects/${projectId}/assign-manager`, { managerId }).then(res => res.data),
    getComplaints: () => api.get('/admin/complaints').then(res => res.data),
    getProjectDetails: (id) => api.get(`/admin/projects`).then(res => res.data).then(data => ({ success: true, project: data.projects.find(p => p._id === id) })), // Reuse existing endpoint for checks
    getProjectReports: (id) => api.get(`/admin/projects/${id}/reports`).then(res => res.data),
    getPayments: () => api.get('/admin/payments').then(res => res.data),
    getProjectPayments: (id) => api.get(`/admin/projects/${id}/payments`).then(res => res.data),
    paymentAction: (id, action) => api.put(`/admin/payments/${id}/${action}`).then(res => res.data),

    // User Updates (Admin initiated)
    updateManager: (id, formData) => api.put(`/admin/managers/${id}`, formData).then(res => res.data),
    updateStaff: (id, formData) => api.put(`/admin/staff/${id}`, formData).then(res => res.data),
    updateClient: (id, formData) => api.put(`/admin/clients/${id}`, formData).then(res => res.data),
    toggleAvailability: (id) => api.patch(`/admin/users/${id}/availability`).then(res => res.data),
    updateProject: (id, data) => api.put(`/admin/projects/${id}`, data).then(res => res.data),
    deleteProject: (id) => api.delete(`/admin/projects/${id}`).then(res => res.data),
};

// ✅ STAFF
export const staffAPI = {
    getMyTasks: () => api.get('/staff/tasks').then(res => res.data),
    updateTaskStatus: (id, status) => api.patch(`/staff/tasks/${id}/status`, { status }).then(res => res.data),
    addTaskDocument: (id, formData) => api.post(`/staff/tasks/${id}/documents`, formData).then(res => res.data),
    addTaskMinutes: (taskId, data) => api.post(`/minutes`, data),
    getProjectMinutes: (projectId) => api.get(`/minutes/project/${projectId}`).then(res => res.data),
    getTaskMinutes: (taskId) => api.get(`/minutes/${taskId}`).then(res => res.data),
    deleteMinutes: (id) => api.delete(`/minutes/${id}`).then(res => res.data),
    addTaskReport: (id, formData) => api.post(`/staff/tasks/${id}/reports`, formData).then(res => res.data),
    addTaskWorkUpdate: (id, formData) => api.post(`/staff/tasks/${id}/work-update`, formData).then(res => res.data),
    getTaskUpdates: (id) => api.get(`/staff/tasks/${id}/updates`).then(res => res.data),
    getDashboardStats: () => api.get('/staff/dashboard/stats').then(res => res.data),
};

// ✅ MANAGER
export const managerAPI = {
    getDashboardStats: () => api.get('/manager/dashboard').then(res => res.data),
    getProjects: () => api.get('/manager/projects').then(res => res.data),
    getMonthlyReports: (projectId) => api.get(`/manager/projects/${projectId}/monthly-reports`).then(res => res.data),
    addMonthlyReport: (projectId, formData) => api.post(`/manager/projects/${projectId}/monthly-reports`, formData).then(res => res.data),
    getComplaints: () => api.get('/manager/complaints').then(res => res.data),
    updateComplaintStatus: (id, status) => api.patch(`/manager/complaints/${id}/status`, { status }).then(res => res.data),
    getMinutes: (projectId) => api.get(`/manager/projects/${projectId}/minutes`).then(res => res.data),
    getProjectTeam: (projectId) => api.get(`/manager/projects/${projectId}/team`).then(res => res.data),
};

// ✅ CLIENT
export const clientAPI = {
    getDashboardStats: () => api.get('/client/dashboard').then(res => res.data),
    getProjects: () => api.get('/client/projects').then(res => res.data),
    getPayments: () => api.get('/client/payments').then(res => res.data),
    getMonthlyReports: (projectId) => api.get(`/client/projects/${projectId}/monthly-reports`).then(res => res.data),
    getProjectDetails: (projectId) => api.get(`/client/projects/${projectId}/details`).then(res => res.data),
    getProjectMinutes: (projectId) => api.get(`/minutes/project/${projectId}`).then(res => res.data),
    getProjectTeam: (projectId) => api.get(`/client/projects/${projectId}/team`).then(res => res.data),
    getProjectUpdates: (projectId) => api.get(`/client/projects/${projectId}/updates`).then(res => res.data),
    getComplaints: () => api.get('/client/complaints').then(res => res.data),
    submitComplaint: (formData) => api.post('/client/complaints', formData).then(res => res.data),
    deleteComplaint: (id) => api.delete(`/client/complaints/${id}`).then(res => res.data),
};

// ✅ DOCUMENTS
export const documentAPI = {
    upload: (formData) => api.post('/documents/upload', formData).then(res => res.data),
    getByProject: (projectId) => api.get(`/documents/${projectId}`).then(res => res.data),
    delete: (id) => api.delete(`/documents/${id}`).then(res => res.data),
};

// ✅ PAYMENTS
export const paymentAPI = {
    request: (data) => api.post('/payment/request', data).then(res => res.data),
    getByProject: (projectId) => api.get(`/payment/${projectId}`).then(res => res.data),
    pay: (formData) => api.post('/payment/pay', formData).then(res => res.data),
    verify: (id) => api.patch(`/payment/verify/${id}`).then(res => res.data),
    getReceipt: (id) => api.get(`/payment/receipt/${id}`).then(res => res.data),
};

// ✅ TASK
export const taskAPI = {
    markUpdateSeen: (updateId, data) => api.patch(`/task/update/mark-seen/${updateId}`, data).then(res => res.data),
    deleteUpdate: (updateId) => api.delete(`/task/update/${updateId}`).then(res => res.data),
};


export default api;
