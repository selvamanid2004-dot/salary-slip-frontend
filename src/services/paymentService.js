/**
 * @file paymentService.js
 * @description Frontend API service for Razorpay checkout, configuration, and verification.
 */

import { apiRequest } from './api';

export const paymentService = {
  /**
   * Checks if Razorpay is configured and gets public key_id
   */
  async getConfig() {
    return apiRequest('/payments/config');
  },

  /**
   * Creates a Razorpay order
   */
  async createOrder(payload) {
    return apiRequest('/payments/create-order', {
      method: 'POST',
      body: payload
    });
  },

  /**
   * Verifies payment and automatically generates GST invoice
   */
  async verifyPayment(payload) {
    return apiRequest('/payments/verify', {
      method: 'POST',
      body: payload
    });
  }
};

