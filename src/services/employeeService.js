/**
 * @file employeeService.js
 * @description Frontend API service for Employee Directory operations.
 */

import { apiRequest } from './api';

export const employeeService = {
  /**
   * Fetch all employees with optional search and department filters
   */
  async getEmployees({ search = '', department = '', status = '' } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (department) params.append('department', department);
    if (status) params.append('status', status);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest(`/employees${query}`);
    return res.data;
  },

  /**
   * Fetch a single employee by ID
   */
  async getEmployeeById(id) {
    const res = await apiRequest(`/employees/${id}`);
    return res.data;
  },

  /**
   * Get employee workforce statistics
   */
  async getStats() {
    const res = await apiRequest('/employees/stats/summary');
    return res.data;
  },

  /**
   * Create a new employee
   */
  async createEmployee(employeeData) {
    const res = await apiRequest('/employees', {
      method: 'POST',
      body: employeeData
    });
    return res.data;
  },

  /**
   * Update an existing employee
   */
  async updateEmployee(id, employeeData) {
    const res = await apiRequest(`/employees/${id}`, {
      method: 'PUT',
      body: employeeData
    });
    return res.data;
  },

  /**
   * Delete an employee
   */
  async deleteEmployee(id) {
    const res = await apiRequest(`/employees/${id}`, {
      method: 'DELETE'
    });
    return res;
  }
};
