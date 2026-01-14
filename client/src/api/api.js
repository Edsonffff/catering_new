import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getCurrentUser = () => api.get('/auth/me');

// Menu
export const getMenuCategories = () => api.get('/menu/categories');
export const getMenuItems = () => api.get('/menu/items');
export const createMenuCategory = (formData) => api.post('/menu/categories', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateMenuCategory = (id, formData) => api.put(`/menu/categories/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteMenuCategory = (id) => api.delete(`/menu/categories/${id}`);
export const createMenuItem = (formData) => api.post('/menu/items', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateMenuItem = (id, formData) => api.put(`/menu/items/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteMenuItem = (id) => api.delete(`/menu/items/${id}`);

// Packages
export const getPackages = () => api.get('/packages');
export const getPackage = (id) => api.get(`/packages/${id}`);
export const createPackage = (formData) => api.post('/packages', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updatePackage = (id, formData) => api.put(`/packages/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deletePackage = (id) => api.delete(`/packages/${id}`);

// Orders
export const createOrder = (orderData) => api.post('/orders', orderData);
export const getOrders = (params) => api.get('/orders', { params });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
export const getOrderStats = () => api.get('/orders/stats/dashboard');

// Reviews
export const getReviews = () => api.get('/reviews');
export const submitReview = (reviewData) => api.post('/reviews', reviewData);
export const getAllReviews = () => api.get('/reviews/all');
export const approveReview = (id, isApproved) => api.put(`/reviews/${id}/approve`, { is_approved: isApproved });
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// Gallery
export const getGallery = (category) => api.get('/gallery', { params: { category } });
export const getAllGallery = () => api.get('/gallery/all');
export const uploadGalleryImage = (formData) => api.post('/gallery', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateGalleryImage = (id, data) => api.put(`/gallery/${id}`, data);
export const deleteGalleryImage = (id) => api.delete(`/gallery/${id}`);

export default api;
