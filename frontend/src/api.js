import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });

// Auth
export const register = (data) => api.post('/users/register', data);
export const login = (data) => api.post('/users/login', data);

// Users
export const getUsers = () => api.get('/users');

// Organizers
export const getOrganizers = () => api.get('/organizers');

// Students
export const getStudents = () => api.get('/students');

// Events
export const getEvents = () => api.get('/events');
export const getEvent = (id) => api.get(`/events/${id}`);
export const createEvent = (data) => api.post('/events', data);
export const getEventSummary = (id) => api.get(`/events/${id}/summary`);
export const getEventsByOrganizer = (organizerId) => api.get(`/events/organizer/${organizerId}`);

// Bookings
export const getBookingsByStudent = (studentId) => api.get(`/bookings/student/${studentId}`);
export const createBooking = (data) => api.post('/bookings', data);
export const checkIn = (id) => api.put(`/bookings/${id}/checkin`);
export const checkOut = (id) => api.put(`/bookings/${id}/checkout`);
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);
export const getTopStudents = () => api.get('/bookings/top-students');
