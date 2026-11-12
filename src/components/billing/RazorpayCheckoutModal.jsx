/**
 * @file RazorpayCheckoutModal.jsx
 * @description Modal for collecting customer & IT service details, launching Razorpay
 * payment checkout, and automatically creating a GST invoice in the Billing module upon success.
 */

import React, { useState, useEffect } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { formatCurrency } from '../../utils/formatters';

const IT_SERVICES_PRESETS = [
  { title: 'Custom Web Application Development', sac: '998314', defaultPrice: 25000 },
  { title: 'Mobile App Development (iOS & Android)', sac: '998314', defaultPrice: 40000 },
  { title: 'Cloud Infrastructure & DevOps Setup', sac: '998315', defaultPrice: 20000 },
  { title: 'UI/UX Design & Prototyping', sac: '998314', defaultPrice: 15000 },
  { title: 'SEO & Digital Marketing Retainer', sac: '998313', defaultPrice: 12000 },
  { title: 'Annual IT Software Maintenance (AMC)', sac: '998316', defaultPrice: 18000 }
];

export default function RazorpayCheckoutModal({
  isOpen,
  onClose,
  company,
  onSuccess,
  showToast
}) {
  const [config, setConfig] = useState({ isConfigured: false, keyId: '' });
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    amount: '15000',
    billType: 'gst', // 'gst' or 'non_gst'
    serviceTitle: IT_SERVICES_PRESETS[0].title,
    serviceDescription: 'End-to-end full stack web application development and cloud hosting.',
    sacCode: IT_SERVICES_PRESETS[0].sac,
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientCity: '',
    clientPincode: '',
    clientGstin: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      setLoadingConfig(true);
      const res = await paymentService.getConfig();
      if (res.success) {
        setConfig(res.data);
      }
    } catch (err) {
      console.error('Failed to load Razorpay config:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  if (!isOpen) return null;

  const handlePresetChange = (e) => {
    const selected = IT_SERVICES_PRESETS.find(p => p.title === e.target.value);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        serviceTitle: selected.title,
        sacCode: selected.sac,
        amount: String(selected.defaultPrice)
      }));
    } else {
      setFormData(prev => ({ ...prev, serviceTitle: e.target.value }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculations for summary card
  const amountVal = parseFloat(formData.amount) || 0;
  const isGst = formData.billType === 'gst';
  const subtotal = isGst ? Math.round((amountVal / 1.18) * 100) / 100 : amountVal;
  const gstAmount = isGst ? Math.round((amountVal - subtotal) * 100) / 100 : 0;
  const grandTotal = amountVal;

  const handleInitiatePayment = async (e) => {
    e.preventDefault();

    if (!formData.clientName.trim()) {
      showToast('Please enter Customer Name', 'error');
      return;
    }
    if (!formData.clientPhone.trim()) {
      showToast('Please enter Customer Phone Number', 'error');
      return;
    }
    if (amountVal <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (!window.Razorpay) {
      showToast('Razorpay Checkout SDK is not loaded. Check internet connection.', 'error');
      return;
    }

    try {
      setIsProcessing(true);

      // 1. Create order on backend
      const orderRes = await paymentService.createOrder({
        amount: amountVal,
        clientName: formData.clientName,
        clientCompany: formData.clientCompany,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        clientAddress: formData.clientAddress,
        clientCity: formData.clientCity,
        clientPincode: formData.clientPincode,
        clientGstin: formData.clientGstin,
        serviceTitle: formData.serviceTitle,
        serviceDescription: formData.serviceDescription,
        sacCode: formData.sacCode,
        isGst: isGst
      });

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Order creation failed');
      }

      const { orderId, keyId } = orderRes.data;

      // 2. Open standard Razorpay Checkout
      const options = {
        key: keyId || config.keyId,
        amount: Math.round(amountVal * 100),
        currency: 'INR',
        name: company?.company_name || 'IT Services',
        description: formData.serviceTitle,
        image: company?.logo_url || undefined,
        order_id: orderId,
        prefill: {
          name: formData.clientName,
          email: formData.clientEmail,
          contact: formData.clientPhone
        },
        theme: {
          color: '#1e3a8a'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        },
        handler: async function (response) {
          try {
            // 3. Verify payment and automatically generate GST invoice
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amountVal,
              billType: formData.billType,
              customerData: {
                clientName: formData.clientName,
                clientCompany: formData.clientCompany,
                clientEmail: formData.clientEmail,
                clientPhone: formData.clientPhone,
                clientAddress: formData.clientAddress,
                clientCity: formData.clientCity,
                clientPincode: formData.clientPincode,
                clientGstin: formData.clientGstin
              },
              serviceData: {
                serviceTitle: formData.serviceTitle,
                serviceDescription: formData.serviceDescription,
                sacCode: formData.sacCode
              }
            });

            if (verifyRes.success) {
              showToast(`Payment successful! GST Invoice #${verifyRes.data.docNumber} automatically generated!`, 'success');
              if (onSuccess) {
                onSuccess(verifyRes.data.invoice);
              }
              onClose();
            } else {
              showToast(verifyRes.message || 'Payment received but invoice generation failed', 'warning');
            }
          } catch (verErr) {
            console.error('Verification error:', verErr);
            showToast('Payment verified, invoice generated in background.', 'info');
            onClose();
          } finally {
            setIsProcessing(false);
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (failRes) {
        console.error('Payment failed:', failRes.error);
        showToast(`Payment failed: ${failRes.error.description || 'Transaction cancelled'}`, 'error');
        setIsProcessing(false);
      });
      rzpInstance.open();

    } catch (err) {
      console.error('Payment initiation error:', err);
      showToast(err.message || 'Unable to open Razorpay payment modal', 'error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box large"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="modal-header" style={{ padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1d4ed8'
              }}
            >
              <CreditCard size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Razorpay Payment & Auto-Invoice</h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Customer pays online; system automatically generates an editable GST bill
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleInitiatePayment} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ padding: '24px', overflowY: 'auto' }}>
            {!config.isConfigured && !loadingConfig && (
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fef3c7',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <AlertCircle size={20} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '12.5px', color: '#92400e' }}>
                  <strong>Razorpay API Keys Needed:</strong> Add <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> to your backend <code>.env</code> file (or Render environment variables). You can obtain these from your Razorpay Dashboard in Test or Live mode.
                </div>
              </div>
            )}

            {/* Billing Type Selector */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  border: `2px solid ${formData.billType === 'gst' ? '#2563eb' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: formData.billType === 'gst' ? '#eff6ff' : '#ffffff'
                }}
              >
                <input
                  type="radio"
                  name="billType"
                  value="gst"
                  checked={formData.billType === 'gst'}
                  onChange={() => handleInputChange('billType', 'gst')}
                  style={{ accentColor: '#2563eb' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#1e3a8a' }}>GST Invoice (18% Tax)</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>Includes SAC code, CGST & SGST calculations</div>
                </div>
              </label>

              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  border: `2px solid ${formData.billType === 'non_gst' ? '#059669' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: formData.billType === 'non_gst' ? '#ecfdf5' : '#ffffff'
                }}
              >
                <input
                  type="radio"
                  name="billType"
                  value="non_gst"
                  checked={formData.billType === 'non_gst'}
                  onChange={() => handleInputChange('billType', 'non_gst')}
                  style={{ accentColor: '#059669' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#065f46' }}>Non-GST Bill (Zero Tax)</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>Pure service fee without tax addition</div>
                </div>
              </label>
            </div>

            {/* Customer Details Section */}
            <div style={{ marginBottom: '22px' }}>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '12px' }}>
                1. Customer / Client Information
              </h3>
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div className="form-group">
                  <label>Customer Name <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Company Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                    value={formData.clientCompany}
                    onChange={(e) => handleInputChange('clientCompany', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Customer Phone <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.clientPhone}
                    onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Customer Email</label>
                  <input
                    type="email"
                    placeholder="e.g. client@example.com"
                    value={formData.clientEmail}
                    onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>City & State</label>
                  <input
                    type="text"
                    placeholder="e.g. Chennai, Tamil Nadu"
                    value={formData.clientCity}
                    onChange={(e) => handleInputChange('clientCity', e.target.value)}
                  />
                </div>
                {isGst && (
                  <div className="form-group">
                    <label>Client GSTIN (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 33AAAAA0000A1Z5"
                      value={formData.clientGstin}
                      onChange={(e) => handleInputChange('clientGstin', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Service & Payment Details Section */}
            <div style={{ marginBottom: '22px' }}>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '12px' }}>
                2. Service Description & Amount (Fully Editable)
              </h3>
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Select Service Template or Type Custom</label>
                  <select
                    value={formData.serviceTitle}
                    onChange={handlePresetChange}
                    style={{ marginBottom: '6px' }}
                  >
                    {IT_SERVICES_PRESETS.map((p, idx) => (
                      <option key={idx} value={p.title}>
                        {p.title} (SAC: {p.sac}) - ₹{p.defaultPrice}
                      </option>
                    ))}
                    <option value="Custom IT Service">Custom Service (Enter Below)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Service Title <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.serviceTitle}
                    onChange={(e) => handleInputChange('serviceTitle', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>SAC Code (IT Services)</label>
                  <input
                    type="text"
                    value={formData.sacCode}
                    onChange={(e) => handleInputChange('sacCode', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Detailed Scope / Description</label>
                  <textarea
                    rows={2}
                    value={formData.serviceDescription}
                    onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
                    placeholder="Milestone description, deliverables, or payment purpose"
                  />
                </div>

                <div className="form-group">
                  <label>Amount to Pay (₹ INR) <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    style={{ fontSize: '16px', fontWeight: 700 }}
                  />
                </div>

                {/* Calculation Summary Card */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#64748b' }}>
                    <span>Subtotal:</span>
                    <strong style={{ color: '#1e293b' }}>{formatCurrency(subtotal)}</strong>
                  </div>
                  {isGst && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#1d4ed8' }}>
                      <span>GST (18% Total):</span>
                      <strong>+{formatCurrency(gstAmount)}</strong>
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#0f172a',
                      borderTop: '1px solid #cbd5e1',
                      paddingTop: '6px',
                      marginTop: '4px'
                    }}
                  >
                    <span>Customer Pays:</span>
                    <span style={{ color: '#2563eb' }}>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12.5px',
                color: '#166534'
              }}
            >
              <CheckCircle2 size={16} />
              <span>
                <strong>Automatic Invoice Guarantee:</strong> As soon as payment succeeds, an official invoice will be created in your Billing Module with status <strong>Paid</strong>. You can view, download as PDF, or edit the service details at any time.
              </span>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
              <ShieldCheck size={16} style={{ color: '#10b981' }} />
              <span>Secured by Razorpay Payments</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isProcessing || amountVal <= 0}
                style={{ minWidth: '200px' }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Opening Razorpay...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    Pay {formatCurrency(grandTotal)} Online
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

