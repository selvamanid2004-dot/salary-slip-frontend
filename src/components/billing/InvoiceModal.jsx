/**
 * @file InvoiceModal.jsx
 * @description Create & Edit Modal for IT Company Quotations and Invoices (GST & Non-GST).
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  FileText,
  Building,
  User,
  CreditCard,
  Percent,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { invoiceService } from '../../services/invoiceService';
import { formatCurrency } from '../../utils/formatters';

const DEFAULT_IT_SERVICES = [
  {
    title: 'Website Development',
    sac_code: '998314',
    description: 'Custom responsive web application design, frontend architecture, and deployment.'
  },
  {
    title: 'Mobile App Development',
    sac_code: '998314',
    description: 'Native or cross-platform iOS & Android mobile application development and publishing.'
  },
  {
    title: 'Custom Software Development',
    sac_code: '998314',
    description: 'Bespoke enterprise software architecture, business logic implementation, and API integration.'
  },
  {
    title: 'UI/UX Design & Prototyping',
    sac_code: '998314',
    description: 'User research, wireframing, high-fidelity Figma mockups, and responsive component library.'
  },
  {
    title: 'Digital Marketing & PPC Campaign',
    sac_code: '998313',
    description: 'Targeted multi-channel ad campaign management, performance analytics, and conversion optimization.'
  },
  {
    title: 'Search Engine Optimization (SEO)',
    sac_code: '998313',
    description: 'Technical SEO audit, on-page optimization, content strategy, keyword research, and SERP monitoring.'
  },
  {
    title: 'Cloud Architecture & DevOps Setup',
    sac_code: '998315',
    description: 'Cloud infrastructure provisioning (AWS/GCP/Azure), CI/CD pipelines, containerization, and monitoring.'
  },
  {
    title: 'API Integration & Backend Architecture',
    sac_code: '998314',
    description: 'RESTful/GraphQL API design, database schema optimization, microservices, and security audits.'
  },
  {
    title: 'Website Maintenance & Support',
    sac_code: '998313',
    description: 'Monthly SLA uptime monitoring, security patches, regular backups, and feature enhancements.'
  },
  {
    title: 'QA & Software Testing',
    sac_code: '998316',
    description: 'Manual and automated regression, load, unit, and end-to-end software quality assurance.'
  },
  {
    title: 'Cybersecurity & Code Audit',
    sac_code: '998319',
    description: 'Vulnerability assessment, penetration testing, compliance checks, and secure code review.'
  },
  {
    title: 'E-Commerce Solution Development',
    sac_code: '998314',
    description: 'Full-featured online store setup, payment gateway integrations, catalog, and order management.'
  }
];

export default function InvoiceModal({
  isOpen,
  onClose,
  editingInvoice,
  initialDocType = 'invoice',
  company,
  onSaved,
  showToast
}) {
  const [docType, setDocType] = useState(initialDocType);
  const [billType, setBillType] = useState('gst');
  const [docNumber, setDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('draft');

  // Customer Details
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientState, setClientState] = useState('');
  const [clientPincode, setClientPincode] = useState('');
  const [clientGstin, setClientGstin] = useState('');

  // Service Line Items
  const [items, setItems] = useState([
    {
      id: 1,
      service_title: 'Website Development',
      description: 'Custom responsive web application design, frontend architecture, and deployment.',
      sac_code: '998314',
      qty: 1,
      rate: 50000,
      amount: 50000
    }
  ]);

  // Tax & Discount Details
  const [taxType, setTaxType] = useState('cgst_sgst'); // 'cgst_sgst' or 'igst'
  const [gstRate, setGstRate] = useState(18);
  const [discountType, setDiscountType] = useState('flat'); // 'flat' or 'percent'
  const [discountValue, setDiscountValue] = useState(0);

  // Bank & Notes
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [bankHolder, setBankHolder] = useState('');
  const [bankUpi, setBankUpi] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');

  const [saving, setSaving] = useState(false);
  const [serviceCatalog, setServiceCatalog] = useState(DEFAULT_IT_SERVICES);

  // Fetch catalog & initialize form
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen, editingInvoice, initialDocType]);

  const loadInitialData = async () => {
    try {
      const catalog = await invoiceService.getCatalog().catch(() => null);
      if (catalog && catalog.length > 0) {
        setServiceCatalog(catalog);
      }
    } catch {
      // Fallback already set
    }

    if (editingInvoice) {
      setDocType(editingInvoice.doc_type || 'invoice');
      setBillType(editingInvoice.bill_type || 'gst');
      setDocNumber(editingInvoice.doc_number || '');
      setIssueDate(editingInvoice.issue_date ? editingInvoice.issue_date.split('T')[0] : '');
      setDueDate(editingInvoice.due_date ? editingInvoice.due_date.split('T')[0] : '');
      setStatus(editingInvoice.status || 'draft');

      setClientName(editingInvoice.client_name || '');
      setClientCompany(editingInvoice.client_company || '');
      setClientPhone(editingInvoice.client_phone || '');
      setClientEmail(editingInvoice.client_email || '');
      setClientAddress(editingInvoice.client_address || '');
      setClientCity(editingInvoice.client_city || '');
      setClientState(editingInvoice.client_state || '');
      setClientPincode(editingInvoice.client_pincode || '');
      setClientGstin(editingInvoice.client_gstin || '');

      let parsedItems = [];
      if (Array.isArray(editingInvoice.items)) {
        parsedItems = editingInvoice.items;
      } else if (typeof editingInvoice.items === 'string') {
        try {
          parsedItems = JSON.parse(editingInvoice.items);
        } catch {
          parsedItems = [];
        }
      }
      setItems(parsedItems.length > 0 ? parsedItems : [{
        id: 1,
        service_title: 'Website Development',
        description: '',
        sac_code: '998314',
        qty: 1,
        rate: 0,
        amount: 0
      }]);

      setTaxType(editingInvoice.tax_type === 'igst' ? 'igst' : 'cgst_sgst');
      setGstRate(parseFloat(editingInvoice.gst_rate) || 18);
      if (parseFloat(editingInvoice.discount_rate) > 0) {
        setDiscountType('percent');
        setDiscountValue(editingInvoice.discount_rate);
      } else {
        setDiscountType('flat');
        setDiscountValue(parseFloat(editingInvoice.discount_amount) || 0);
      }

      setBankName(editingInvoice.bank_name || company?.bank_name || '');
      setBankAccount(editingInvoice.bank_account_no || company?.bank_account_no || '');
      setBankIfsc(editingInvoice.bank_ifsc || company?.bank_ifsc_code || '');
      setBankBranch(editingInvoice.bank_branch || company?.bank_branch || '');
      setBankHolder(editingInvoice.bank_account_holder || company?.bank_account_holder || company?.company_name || '');
      setBankUpi(editingInvoice.bank_upi_id || company?.bank_upi_id || '');
      setNotes(editingInvoice.notes || '');
      setTerms(editingInvoice.terms || '');
    } else {
      // New document
      const currentDocType = initialDocType || 'invoice';
      setDocType(currentDocType);
      setBillType('gst');
      setIssueDate(new Date().toISOString().split('T')[0]);

      // Calculate default due date (15 days later for invoice, 30 days for quote)
      const due = new Date();
      due.setDate(due.getDate() + (currentDocType === 'quotation' ? 30 : 15));
      setDueDate(due.toISOString().split('T')[0]);

      setStatus(currentDocType === 'quotation' ? 'draft' : 'unpaid');
      setClientName('');
      setClientCompany('');
      setClientPhone('');
      setClientEmail('');
      setClientAddress('');
      setClientCity('');
      setClientState('');
      setClientPincode('');
      setClientGstin('');

      setItems([
        {
          id: 1,
          service_title: 'Website Development',
          description: 'Custom responsive web application design, frontend architecture, and deployment.',
          sac_code: '998314',
          qty: 1,
          rate: 50000,
          amount: 50000
        }
      ]);

      setTaxType('cgst_sgst');
      setGstRate(18);
      setDiscountType('flat');
      setDiscountValue(0);

      // Company defaults
      setBankName(company?.bank_name || '');
      setBankAccount(company?.bank_account_no || '');
      setBankIfsc(company?.bank_ifsc_code || '');
      setBankBranch(company?.bank_branch || '');
      setBankHolder(company?.bank_account_holder || company?.company_name || '');
      setBankUpi(company?.bank_upi_id || '');
      setNotes(currentDocType === 'quotation' ? 'Quotation valid for 30 calendar days from issue date.' : 'Thank you for your business. Net payable within 15 days.');
      setTerms(
        '1. Remit payments only to the designated company bank account.\n2. Please mention invoice/quote number in transfer remarks.\n3. SLA support applies as per agreement.'
      );

      // Fetch sequential number
      try {
        const nextNum = await invoiceService.getNextNumber(currentDocType);
        setDocNumber(nextNum);
      } catch {
        setDocNumber(`${currentDocType === 'quotation' ? 'QT' : 'INV'}-${new Date().getFullYear()}-0001`);
      }
    }
  };

  // Switch doc type on toggle
  const handleDocTypeChange = async (newType) => {
    setDocType(newType);
    if (!editingInvoice) {
      try {
        const nextNum = await invoiceService.getNextNumber(newType);
        setDocNumber(nextNum);
      } catch {
        setDocNumber(`${newType === 'quotation' ? 'QT' : 'INV'}-${new Date().getFullYear()}-0001`);
      }
    }
  };

  // Item management
  const handleItemChange = (index, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === 'qty' || field === 'rate') {
        const q = parseFloat(field === 'qty' ? value : item.qty) || 0;
        const r = parseFloat(field === 'rate' ? value : item.rate) || 0;
        item.amount = Math.round(q * r * 100) / 100;
      }

      updated[index] = item;
      return updated;
    });
  };

  const handleServiceSelect = (index, serviceTitle) => {
    const selected = serviceCatalog.find(s => s.title === serviceTitle);
    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        service_title: serviceTitle,
        sac_code: billType === 'gst' ? (selected?.sac_code || '998314') : '',
        description: selected?.description || updated[index].description || ''
      };
      return updated;
    });
  };

  const addItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: Date.now(),
        service_title: 'Custom Software Development',
        description: 'Bespoke software architecture, business logic implementation, and API integration.',
        sac_code: billType === 'gst' ? '998314' : '',
        qty: 1,
        rate: 0,
        amount: 0
      }
    ]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) {
      showToast?.('At least one service line item is required', 'warning');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Real-time calculation helpers
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = Math.round(((subtotal * (parseFloat(discountValue) || 0)) / 100) * 100) / 100;
  } else {
    discountAmount = Math.min(subtotal, parseFloat(discountValue) || 0);
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let totalTax = 0;

  if (billType === 'gst') {
    const rate = parseFloat(gstRate) || 18;
    if (taxType === 'igst') {
      igst = Math.round(((taxableAmount * rate) / 100) * 100) / 100;
      totalTax = igst;
    } else {
      const half = rate / 2;
      cgst = Math.round(((taxableAmount * half) / 100) * 100) / 100;
      sgst = Math.round(((taxableAmount * half) / 100) * 100) / 100;
      totalTax = Math.round((cgst + sgst) * 100) / 100;
    }
  }

  const grandTotal = Math.round((taxableAmount + totalTax) * 100) / 100;

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientName.trim() || !clientPhone.trim()) {
      showToast?.('Please provide Customer Name and Contact Number.', 'error');
      return;
    }

    if (items.length === 0 || subtotal <= 0) {
      showToast?.('Please enter at least one valid service with a charge.', 'error');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        doc_type: docType,
        bill_type: billType,
        doc_number: docNumber,
        issue_date: issueDate,
        due_date: dueDate || null,
        status,
        client_name: clientName,
        client_company: clientCompany,
        client_phone: clientPhone,
        client_email: clientEmail,
        client_address: clientAddress,
        client_city: clientCity,
        client_state: clientState,
        client_pincode: clientPincode,
        client_gstin: clientGstin,
        items,
        tax_type: billType === 'gst' ? taxType : 'none',
        gst_rate: billType === 'gst' ? gstRate : 0,
        discount_rate: discountType === 'percent' ? parseFloat(discountValue) || 0 : 0,
        discount_amount: discountAmount,
        bank_name: bankName,
        bank_account_no: bankAccount,
        bank_ifsc: bankIfsc,
        bank_branch: bankBranch,
        bank_account_holder: bankHolder,
        bank_upi_id: bankUpi,
        notes,
        terms
      };

      let result;
      if (editingInvoice?.id) {
        result = await invoiceService.updateDocument(editingInvoice.id, payload);
        showToast?.(`${docType === 'quotation' ? 'Quotation' : 'Invoice'} updated successfully.`, 'success');
      } else {
        result = await invoiceService.createDocument(payload);
        showToast?.(`${docType === 'quotation' ? 'Quotation' : 'Invoice'} created successfully.`, 'success');
      }

      if (onSaved) onSaved(result);
      onClose();
    } catch (err) {
      showToast?.(err.message || 'Failed to save billing document', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box large"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '960px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="modal-header" style={{ padding: '16px 24px' }}>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0 }}>
              {editingInvoice ? `Edit ${docType === 'quotation' ? 'Quotation' : 'Invoice'}` : `Create New ${docType === 'quotation' ? 'Quotation' : 'Invoice'}`}
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Tailored for IT Software, App Development, UI/UX, SEO, and Technical Services
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
            {/* Top Selector: Document Type & Bill Type Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                marginBottom: '20px'
              }}
            >
              {/* Document Type Selector */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '6px' }}>
                  Document Type
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${docType === 'invoice' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1 }}
                    onClick={() => handleDocTypeChange('invoice')}
                  >
                    <FileText size={14} />
                    Invoice / Bill
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${docType === 'quotation' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1 }}
                    onClick={() => handleDocTypeChange('quotation')}
                  >
                    <FileText size={14} />
                    Quotation / Estimate
                  </button>
                </div>
              </div>

              {/* Bill Type Selector: GST vs Non-GST */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '6px' }}>
                  Taxation Type
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${billType === 'gst' ? 'btn-primary' : 'btn-outline'}`}
                    style={{
                      flex: 1,
                      backgroundColor: billType === 'gst' ? '#1e40af' : '',
                      borderColor: billType === 'gst' ? '#1e40af' : ''
                    }}
                    onClick={() => setBillType('gst')}
                  >
                    <CheckCircle size={14} />
                    1. GST Bill
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${billType === 'non_gst' ? 'btn-primary' : 'btn-outline'}`}
                    style={{
                      flex: 1,
                      backgroundColor: billType === 'non_gst' ? '#047857' : '',
                      borderColor: billType === 'non_gst' ? '#047857' : ''
                    }}
                    onClick={() => setBillType('non_gst')}
                  >
                    <CheckCircle size={14} />
                    2. Non-GST Bill
                  </button>
                </div>
              </div>
            </div>

            {/* Document Metadata Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">
                  {docType === 'quotation' ? 'Quote #' : 'Invoice #'} <span className="req">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Issue Date <span className="req">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {docType === 'quotation' ? 'Valid Until' : 'Due Date'}
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {docType === 'quotation' ? (
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
              </div>
            </div>

            {/* Customer Details Box */}
            <div
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                backgroundColor: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <User size={16} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Customer & Client Details</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Client / Contact Name <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rajesh Mehta"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Customer Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Nexus FinTech Solutions Pvt Ltd"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Contact Number <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. +91 98765 43210"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. accounts@nexusfintech.io"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Billing Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Plot 12, Whitefield EPIP Industrial Zone"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Bengaluru"
                    value={clientCity}
                    onChange={(e) => setClientCity(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Karnataka"
                    value={clientState}
                    onChange={(e) => setClientState(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PIN Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="560066"
                    value={clientPincode}
                    onChange={(e) => setClientPincode(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Client GSTIN {billType === 'gst' ? '(Optional)' : '(N/A for Non-GST)'}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="29AABCN8291M1Z8"
                    value={clientGstin}
                    onChange={(e) => setClientGstin(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* IT Service Line Items */}
            <div
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                backgroundColor: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={16} style={{ color: 'var(--color-primary)' }} />
                  <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>IT Service Line Items</h3>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={addItem}
                >
                  <Plus size={14} />
                  Add Service
                </button>
              </div>

              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    marginBottom: '10px'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr 40px', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                    {/* Service Preset Dropdown / Custom Input */}
                    <div>
                      <label className="form-label" style={{ fontSize: '11px', marginBottom: '2px' }}>
                        Service Name
                      </label>
                      <select
                        className="form-control form-control-sm"
                        value={item.service_title}
                        onChange={(e) => handleServiceSelect(idx, e.target.value)}
                        style={{ fontWeight: 600 }}
                      >
                        {serviceCatalog.map((s, sIdx) => (
                          <option key={sIdx} value={s.title}>{s.title}</option>
                        ))}
                      </select>
                    </div>

                    {billType === 'gst' ? (
                      <div>
                        <label className="form-label" style={{ fontSize: '11px', marginBottom: '2px' }}>
                          SAC Code
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={item.sac_code || '998314'}
                          onChange={(e) => handleItemChange(idx, 'sac_code', e.target.value)}
                          placeholder="998314"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="form-label" style={{ fontSize: '11px', marginBottom: '2px' }}>
                          Unit / Type
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={item.unit || 'Project'}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          placeholder="Project / Month"
                        />
                      </div>
                    )}

                    <div>
                      <label className="form-label" style={{ fontSize: '11px', marginBottom: '2px' }}>
                        Qty / Sprints
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        className="form-control form-control-sm"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '11px', marginBottom: '2px' }}>
                        Service Charge (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        className="form-control form-control-sm"
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                      />
                    </div>

                    <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                      <button
                        type="button"
                        className="icon-btn"
                        style={{ color: 'var(--color-danger)' }}
                        onClick={() => removeItem(idx)}
                        title="Remove service"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Scope description for the service */}
                  <div>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Detailed scope/features (e.g. React frontend, Node.js API, 3 review rounds)"
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations & Taxes Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' }}>
              {/* Left Column: Tax Structure (if GST) & Discounts */}
              <div
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Percent size={16} style={{ color: 'var(--color-primary)' }} />
                  <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Taxes & Discounts</h3>
                </div>

                {billType === 'gst' ? (
                  <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>
                      GST Configuration (Standard IT Rate 18%)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '11px' }}>GST Rate (%)</label>
                        <select
                          className="form-control form-control-sm"
                          value={gstRate}
                          onChange={(e) => setGstRate(parseFloat(e.target.value))}
                        >
                          <option value="18">18% (Standard IT Services)</option>
                          <option value="12">12%</option>
                          <option value="5">5%</option>
                          <option value="28">28%</option>
                          <option value="0">0%</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '11px' }}>Tax Type</label>
                        <select
                          className="form-control form-control-sm"
                          value={taxType}
                          onChange={(e) => setTaxType(e.target.value)}
                        >
                          <option value="cgst_sgst">Intra-State (CGST + SGST: 9% + 9%)</option>
                          <option value="igst">Inter-State (IGST: 18%)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>
                      ✓ Non-GST Billing Mode
                    </div>
                    <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
                      No tax calculation will be applied. Subtotal directly equals the Grand Total.
                    </div>
                  </div>
                )}

                {/* Discount */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '11px' }}>Discount Type</label>
                    <select
                      className="form-control form-control-sm"
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                    >
                      <option value="flat">Flat Amount (₹)</option>
                      <option value="percent">Percentage (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '11px' }}>Discount Value</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control form-control-sm"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Live Calculated Summary */}
              <div
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0' }}>Financial Summary</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                    <span style={{ fontWeight: 700 }}>₹{formatCurrency(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', color: 'var(--color-danger)' }}>
                        <span>Discount {discountType === 'percent' ? `(${discountValue}%)` : ''}:</span>
                        <span style={{ fontWeight: 700 }}>-₹{formatCurrency(discountAmount)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Taxable Value:</span>
                        <span style={{ fontWeight: 700 }}>₹{formatCurrency(taxableAmount)}</span>
                      </div>
                    </>
                  )}

                  {billType === 'gst' ? (
                    <>
                      {taxType === 'igst' ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                          <span>IGST ({gstRate}%):</span>
                          <span style={{ fontWeight: 600 }}>₹{formatCurrency(igst)}</span>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                            <span>CGST ({gstRate / 2}%):</span>
                            <span style={{ fontWeight: 600 }}>₹{formatCurrency(cgst)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                            <span>SGST ({gstRate / 2}%):</span>
                            <span style={{ fontWeight: 600 }}>₹{formatCurrency(sgst)}</span>
                          </div>
                        </>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '6px' }}>
                        <span style={{ fontWeight: 600, color: '#1e40af' }}>Total GST Tax:</span>
                        <span style={{ fontWeight: 700, color: '#1e40af' }}>₹{formatCurrency(totalTax)}</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#047857', padding: '6px 0', borderTop: '1px solid var(--border-light)' }}>
                      Non-GST (Tax Exempt: ₹0.00)
                    </div>
                  )}
                </div>

                <div
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '10px'
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 800 }}>Grand Total:</span>
                  <span style={{ fontSize: '17px', fontWeight: 800 }}>₹{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Bank Details Verification Section */}
            <div
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                backgroundColor: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <CreditCard size={16} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Company Bank Account (Printed on Bill)</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '10px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px' }}>Bank Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank Ltd."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px' }}>Account Number</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="e.g. 50200084920194"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px' }}>IFSC Code</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value)}
                    placeholder="e.g. HDFC0001234"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px' }}>Branch Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                    placeholder="Branch"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px' }}>Account Holder</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={bankHolder}
                    onChange={(e) => setBankHolder(e.target.value)}
                    placeholder="Holder Name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px' }}>UPI ID</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={bankUpi}
                    onChange={(e) => setBankUpi(e.target.value)}
                    placeholder="company@upi"
                  />
                </div>
              </div>
            </div>

            {/* Terms & Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  rows="2"
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes for client"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Terms &amp; Conditions</label>
                <textarea
                  rows="2"
                  className="form-control"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Payment terms and delivery agreement"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '14px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid var(--border-light)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving...' : editingInvoice ? `Save Changes` : `Create ${docType === 'quotation' ? 'Quotation' : 'Invoice'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

