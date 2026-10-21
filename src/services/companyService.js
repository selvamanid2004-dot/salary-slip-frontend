/**
 * @file companyService.js
 * @description Frontend API service for Company Profile & Letterhead settings.
 */

import { apiRequest } from './api';

export const companyService = {
  /**
   * Fetch company profile
   */
  async getCompany() {
    const res = await apiRequest('/company');
    return res.data;
  },

  /**
   * Update company profile
   */
  async updateCompany(data) {
    const res = await apiRequest('/company', {
      method: 'PUT',
      body: data
    });
    return res.data;
  }
};
