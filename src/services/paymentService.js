/**
 * @file paymentService.js
 * @description Frontend API service for Razorpay checkout, configuration, and verification.
 */

const API_BASE = '/api/payments';

export const paymentService = {
  /**
   * Checks if Razorpay is configured and gets public key_id
   */
  async getConfig() {
    const res = await fetch(`${API_BASE}/config`);
    return res.json();
  },

  /**
   * Creates a Razorpay order
   */
  async createOrder(payload) {
    const res = await fetch(`${API_BASE}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  /**
   * Verifies payment and automatically generates GST invoice
   */
  async verifyPayment(payload) {
    const res = await fetch(`${API_BASE}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  }
};

