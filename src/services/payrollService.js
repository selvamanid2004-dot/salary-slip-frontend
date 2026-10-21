/**
 * @file payrollService.js
 * @description Frontend API service for Payroll and Salary Slip operations.
 */

import { apiRequest } from './api';

export const payrollService = {
  /**
   * Fetch salary slips with optional month, year, or employee filters
   */
  async getPayrolls({ month, year, employee_id, status } = {}) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    if (employee_id) params.append('employee_id', employee_id);
    if (status) params.append('status', status);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest(`/payroll${query}`);
    return res.data;
  },

  /**
   * Fetch single salary slip by ID
   */
  async getPayrollById(id) {
    const res = await apiRequest(`/payroll/${id}`);
    return res.data;
  },

  /**
   * Fetch payroll summary metrics
   */
  async getSummary({ month, year } = {}) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest(`/payroll/summary/stats${query}`);
    return res.data;
  },

  /**
   * Preview salary calculation
   */
  async previewPayroll(payload) {
    const res = await apiRequest('/payroll/preview', {
      method: 'POST',
      body: payload
    });
    return res.data;
  },

  /**
   * Generate and persist salary slip
   */
  async generatePayroll(payload) {
    const res = await apiRequest('/payroll/generate', {
      method: 'POST',
      body: payload
    });
    return res.data;
  },

  /**
   * Delete a salary slip
   */
  async deletePayroll(id) {
    const res = await apiRequest(`/payroll/${id}`, {
      method: 'DELETE'
    });
    return res;
  },

  /**
   * Bulk generate payroll for all or selected employees
   */
  async bulkGeneratePayroll(payload) {
    const res = await apiRequest('/payroll/bulk-generate', {
      method: 'POST',
      body: payload
    });
    return res;
  },

  /**
   * Helper to get direct CSV export download URL
   */
  getExportCsvUrl({ month, year, employee_id } = {}) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    if (employee_id) params.append('employee_id', employee_id);
    const token = localStorage.getItem('workpulse_admin_token');
    if (token) params.append('token', token);
    const query = params.toString() ? `?${params.toString()}` : '';
    const origin = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
    return `${origin}/api/payroll/export/csv${query}`;
  },

  /**
   * Helper to get direct printable HTML URL
   */
  getPrintHtmlUrl(id) {
    const token = localStorage.getItem('workpulse_admin_token');
    const origin = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
    return `${origin}/api/payroll/${id}/html${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  /**
   * Fetch 12-month annual salary statement for an employee
   */
  async getAnnualStatement(employeeId, year) {
    const res = await apiRequest(`/payroll/annual-statement?employee_id=${employeeId}&year=${year}`);
    return res.data;
  }
};
