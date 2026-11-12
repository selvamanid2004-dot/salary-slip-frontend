/**
 * @file Billing.jsx
 * @description Main dashboard and management page for IT Company Quotations & Invoices.
 * Supports GST and Non-GST bills, conversion from quotation to invoice, PDF downloads, and printing.
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Download,
  Edit,
  Trash2,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Receipt,
  Building,
  Filter,
  RefreshCw,
  Printer
} from 'lucide-react';
import { invoiceService } from '../services/invoiceService';
import { formatCurrency } from '../utils/formatters';

export default function Billing({
  company,
  showToast,
  onOpenPreview,
  onOpenCreateModal,
  onOpenEditModal,
  refreshTrigger
}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('all'); // all, quotation, invoice
  const [billTypeFilter, setBillTypeFilter] = useState('all'); // all, gst, non_gst
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadDocuments();
  }, [refreshTrigger, docTypeFilter, billTypeFilter, statusFilter]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getDocuments({
        doc_type: docTypeFilter,
        bill_type: billTypeFilter,
        status: statusFilter,
        search
      });
      setDocuments(data || []);
    } catch (err) {
      showToast('Failed to load billing documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDocuments();
  };

  const handleDelete = async (id, docNumber) => {
    if (!window.confirm(`Are you sure you want to delete ${docNumber}?`)) {
      return;
    }
    try {
      await invoiceService.deleteDocument(id);
      showToast(`${docNumber} deleted successfully.`, 'success');
      loadDocuments();
    } catch (err) {
      showToast(err.message || 'Failed to delete document', 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await invoiceService.updateStatus(id, newStatus);
      showToast(`Status updated to ${newStatus}.`, 'success');
      loadDocuments();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleConvertToInvoice = async (quotation) => {
    if (!window.confirm(`Convert Quotation ${quotation.doc_number} for "${quotation.client_name}" into an official Invoice?`)) {
      return;
    }
    try {
      const createdInvoice = await invoiceService.convertQuotation(quotation.id);
      showToast(`Converted to official Invoice ${createdInvoice.doc_number}!`, 'success');
      loadDocuments();
      if (onOpenPreview) {
        onOpenPreview(createdInvoice);
      }
    } catch (err) {
      showToast(err.message || 'Failed to convert quotation', 'error');
    }
  };

  // Metrics computation
  const invoicesList = documents.filter(d => d.doc_type === 'invoice');
  const quotationsList = documents.filter(d => d.doc_type === 'quotation');
  const totalInvoiced = invoicesList.reduce((sum, d) => sum + (parseFloat(d.grand_total) || 0), 0);
  const totalQuoted = quotationsList.reduce((sum, d) => sum + (parseFloat(d.grand_total) || 0), 0);
  const gstCount = documents.filter(d => d.bill_type === 'gst').length;
  const nonGstCount = documents.filter(d => d.bill_type === 'non_gst').length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="page-container">
      {/* 1. Header Section */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">IT Quotations &amp; Billing</h1>
          <p className="page-subtitle">
            Manage GST and Non-GST quotations and invoices specifically designed for IT &amp; software services
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-outline"
            onClick={() => onOpenCreateModal && onOpenCreateModal('quotation')}
          >
            <Plus size={16} />
            New Quotation
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onOpenCreateModal && onOpenCreateModal('invoice')}
          >
            <Plus size={16} />
            New Invoice / Bill
          </button>
        </div>
      </div>

      {/* 2. Top Stats Overview */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Receipt size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Invoiced Amount</span>
            <span className="stat-value">{formatCurrency(totalInvoiced)}</span>
            <span className="stat-desc">{invoicesList.length} IT Services Invoices</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <FileText size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Quotations Value</span>
            <span className="stat-value">{formatCurrency(totalQuoted)}</span>
            <span className="stat-desc">{quotationsList.length} Project Proposals</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
            <ShieldCheck size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">GST Compliant Bills</span>
            <span className="stat-value">{gstCount}</span>
            <span className="stat-desc">With SAC Code 9983 &amp; GST tax breakdown</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Non-GST Bills</span>
            <span className="stat-value">{nonGstCount}</span>
            <span className="stat-desc">Zero Tax applied</span>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            {/* Search */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', minWidth: '300px', flex: 1 }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  placeholder="Search by client, company name, or document #..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-secondary btn-sm">
                Search
              </button>
            </form>

            {/* Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Doc Type Filter */}
              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${docTypeFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={() => setDocTypeFilter('all')}
                >
                  All Types
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${docTypeFilter === 'invoice' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={() => setDocTypeFilter('invoice')}
                >
                  Invoices
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${docTypeFilter === 'quotation' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={() => setDocTypeFilter('quotation')}
                >
                  Quotations
                </button>
              </div>

              {/* Bill Type Filter (GST vs Non-GST) */}
              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${billTypeFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={() => setBillTypeFilter('all')}
                >
                  All Bills
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${billTypeFilter === 'gst' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={() => setBillTypeFilter('gst')}
                >
                  GST
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${billTypeFilter === 'non_gst' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={() => setBillTypeFilter('non_gst')}
                >
                  Non-GST
                </button>
              </div>

              {/* Status Select */}
              <select
                className="form-control form-control-sm"
                style={{ width: '130px', fontSize: '12px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                className="icon-btn"
                onClick={loadDocuments}
                title="Refresh List"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Documents Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Doc #</th>
                <th style={{ width: '90px' }}>Type</th>
                <th style={{ width: '100px' }}>Bill Category</th>
                <th>Client / Customer</th>
                <th>Service(s)</th>
                <th style={{ width: '110px' }}>Date</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Grand Total</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Status</th>
                <th style={{ width: '170px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Loading IT Billing records...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
                      <FileText size={40} style={{ opacity: 0.4, margin: '0 auto' }} />
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                      No quotations or invoices found
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
                      Create your first IT service quotation or GST / Non-GST invoice to get started.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onOpenCreateModal && onOpenCreateModal('quotation')}
                      >
                        <Plus size={14} />
                        Create Quotation
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onOpenCreateModal && onOpenCreateModal('invoice')}
                      >
                        <Plus size={14} />
                        Create Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const isQuotation = doc.doc_type === 'quotation';
                  const isGst = doc.bill_type === 'gst';

                  let items = [];
                  if (Array.isArray(doc.items)) items = doc.items;
                  else if (typeof doc.items === 'string') {
                    try { items = JSON.parse(doc.items); } catch { items = []; }
                  }

                  const firstService = items[0]?.service_title || 'IT Service';
                  const extraServicesCount = items.length - 1;

                  return (
                    <tr key={doc.id}>
                      {/* Doc # */}
                      <td>
                        <span
                          style={{ fontWeight: 700, color: 'var(--color-primary)', cursor: 'pointer' }}
                          onClick={() => onOpenPreview && onOpenPreview(doc)}
                          title="Click to preview"
                        >
                          {doc.doc_number}
                        </span>
                      </td>

                      {/* Doc Type Badge */}
                      <td>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: isQuotation ? '#fef3c7' : '#e0e7ff',
                            color: isQuotation ? '#92400e' : '#3730a3',
                            border: `1px solid ${isQuotation ? '#fde68a' : '#c7d2fe'}`
                          }}
                        >
                          {isQuotation ? 'Quotation' : 'Invoice'}
                        </span>
                      </td>

                      {/* Bill Type Badge (GST vs Non-GST) */}
                      <td>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: isGst ? '#eff6ff' : '#ecfdf5',
                            color: isGst ? '#1d4ed8' : '#065f46',
                            border: `1px solid ${isGst ? '#bfdbfe' : '#a7f3d0'}`
                          }}
                        >
                          {isGst ? 'GST Bill' : 'Non-GST'}
                        </span>
                      </td>

                      {/* Client Info */}
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {doc.client_name}
                        </div>
                        {doc.client_company && (
                          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                            {doc.client_company}
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {doc.client_phone}
                        </div>
                      </td>

                      {/* Services Summary */}
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                          {firstService}
                        </div>
                        {extraServicesCount > 0 && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            +{extraServicesCount} more service{extraServicesCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {formatDate(doc.issue_date)}
                      </td>

                      {/* Grand Total */}
                      <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '13.5px', color: '#0f172a' }}>
                        {formatCurrency(doc.grand_total || 0)}
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        <select
                          value={doc.status || 'draft'}
                          onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 6px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-medium)',
                            backgroundColor:
                              doc.status === 'paid' ? '#ecfdf5' :
                              doc.status === 'accepted' ? '#f3e8ff' :
                              doc.status === 'sent' ? '#eff6ff' :
                              doc.status === 'unpaid' ? '#fff7ed' : '#f8fafc',
                            color:
                              doc.status === 'paid' ? '#065f46' :
                              doc.status === 'accepted' ? '#6b21a8' :
                              doc.status === 'sent' ? '#1e40af' :
                              doc.status === 'unpaid' ? '#9a3412' : '#475569',
                            cursor: 'pointer'
                          }}
                        >
                          {isQuotation ? (
                            <>
                              <option value="draft">Draft</option>
                              <option value="sent">Sent</option>
                              <option value="accepted">Accepted</option>
                              <option value="declined">Declined</option>
                            </>
                          ) : (
                            <>
                              <option value="draft">Draft</option>
                              <option value="unpaid">Unpaid</option>
                              <option value="paid">Paid</option>
                              <option value="cancelled">Cancelled</option>
                            </>
                          )}
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                          {/* Preview & Print */}
                          <button
                            className="icon-btn"
                            onClick={() => onOpenPreview && onOpenPreview(doc)}
                            title="Preview & Download PDF"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Convert to Invoice if Quotation */}
                          {isQuotation && doc.status !== 'accepted' && (
                            <button
                              className="icon-btn"
                              style={{ color: '#2563eb' }}
                              onClick={() => handleConvertToInvoice(doc)}
                              title="Convert to Official Invoice"
                            >
                              <ArrowRightLeft size={15} />
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            className="icon-btn"
                            onClick={() => onOpenEditModal && onOpenEditModal(doc)}
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            className="icon-btn"
                            style={{ color: 'var(--color-danger)' }}
                            onClick={() => handleDelete(doc.id, doc.doc_number)}
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

