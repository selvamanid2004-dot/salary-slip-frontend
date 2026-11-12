/**
 * @file invoiceService.js
 * @description Frontend API service for IT Company Quotation and Billing operations.
 */

import { apiRequest } from './api';

export const invoiceService = {
  /**
   * Fetch documents with optional filtering
   */
  async getDocuments({ doc_type, bill_type, status, search } = {}) {
    const params = new URLSearchParams();
    if (doc_type && doc_type !== 'all') params.append('doc_type', doc_type);
    if (bill_type && bill_type !== 'all') params.append('bill_type', bill_type);
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest(`/billing${query}`);
    return res.data;
  },

  /**
   * Fetch IT services preset catalog
   */
  async getCatalog() {
    const res = await apiRequest('/billing/catalog');
    return res.data;
  },

  /**
   * Fetch next available document number
   */
  async getNextNumber(docType = 'invoice') {
    const res = await apiRequest(`/billing/next-number?type=${docType}`);
    return res.data?.next_number;
  },

  /**
   * Fetch single document by ID
   */
  async getDocumentById(id) {
    const res = await apiRequest(`/billing/${id}`);
    return res.data;
  },

  /**
   * Create new Quotation or Invoice
   */
  async createDocument(payload) {
    const res = await apiRequest('/billing', {
      method: 'POST',
      body: payload
    });
    return res.data;
  },

  /**
   * Update existing Quotation or Invoice
   */
  async updateDocument(id, payload) {
    const res = await apiRequest(`/billing/${id}`, {
      method: 'PUT',
      body: payload
    });
    return res.data;
  },

  /**
   * Update document status
   */
  async updateStatus(id, status) {
    const res = await apiRequest(`/billing/${id}/status`, {
      method: 'PATCH',
      body: { status }
    });
    return res.data;
  },

  /**
   * Convert quotation into official invoice
   */
  async convertQuotation(id) {
    const res = await apiRequest(`/billing/${id}/convert`, {
      method: 'POST'
    });
    return res.data;
  },

  /**
   * Delete document
   */
  async deleteDocument(id) {
    const res = await apiRequest(`/billing/${id}`, {
      method: 'DELETE'
    });
    return res;
  },

  /**
   * Get direct printable HTML view URL
   */
  getPrintUrl(id) {
    const token = localStorage.getItem('workpulse_admin_token');
    const origin = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
    return `${origin}/api/billing/${id}/print${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  }
};

