/**
 * @file Settings.jsx
 * @description Company Settings interface with Company Logo upload,
 * Company Name, Address, and Mobile Number management.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Building2, Save, Upload, X, Image as ImageIcon, Database, RefreshCw } from 'lucide-react';
import { companyService } from '../services/companyService';
import { checkServerHealth } from '../services/api';

export default function Settings({ showToast, onCompanyUpdated }) {
  const [formData, setFormData] = useState({
    company_name: '',
    address: '',
    address_line1: '',
    mobile_number: '',
    phone: '',
    logo_url: ''
  });

  const [dbStatus, setDbStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [company, health] = await Promise.all([
        companyService.getCompany(),
        checkServerHealth().catch(() => null)
      ]);

      if (company) {
        setFormData({
          company_name: company.company_name || '',
          address: company.address || company.address_line1 || '',
          address_line1: company.address_line1 || company.address || '',
          mobile_number: company.mobile_number || company.phone || '',
          phone: company.phone || company.mobile_number || '',
          logo_url: company.logo_url || ''
        });
      }
      if (health?.database) {
        setDbStatus(health.database);
      }
    } catch (err) {
      showToast('Failed to load company settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Logo Upload (Converts to Base64 Data URL)
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, SVG, WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Logo file size must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target.result;
      setFormData(prev => ({
        ...prev,
        logo_url: base64Url
      }));
      showToast('Logo uploaded. Click "Save Company Settings" to apply.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...formData,
        address_line1: formData.address,
        phone: formData.mobile_number
      };
      const updated = await companyService.updateCompany(payload);
      showToast('Company details and logo saved successfully', 'success');
      if (onCompanyUpdated) onCompanyUpdated(updated);
    } catch (err) {
      showToast(err.message || 'Failed to update company settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
      {/* 1. Company Information & Logo Form */}
      <div className="card" style={{ gridColumn: 'span 2' }}>
        <div className="card-header">
          <div>
            <h2>Company Details & Logo</h2>
            <p>Configure company branding, address, and contact details stamped on every payslip</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card-body">
            {/* Logo Upload Section */}
            <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                Company Logo
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {/* Logo Preview Box */}
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '8px',
                    border: '2px dashed var(--border-medium)',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  {formData.logo_url ? (
                    <img
                      src={formData.logo_url}
                      alt="Company Logo Preview"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      <ImageIcon size={32} style={{ margin: '0 auto 4px auto', opacity: 0.6 }} />
                      <span style={{ fontSize: '11px' }}>No Logo</span>
                    </div>
                  )}
                </div>

                {/* Upload Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} />
                      {formData.logo_url ? 'Change Logo' : 'Upload Logo'}
                    </button>

                    {formData.logo_url && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleRemoveLogo}
                      >
                        <X size={14} />
                        Remove
                      </button>
                    )}
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                    Supports PNG, JPG, or SVG up to 5MB. The logo uploaded here automatically appears on the payslip.
                  </p>
                </div>
              </div>
            </div>

            {/* Company Name */}
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label">
                Company Name <span className="req">*</span>
              </label>
              <input
                type="text"
                name="company_name"
                className="form-control"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="e.g. Apex Global Technologies Ltd."
                required
              />
            </div>

            {/* Company Address */}
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label">
                Address <span className="req">*</span>
              </label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Tower 4, Cyber City Phase 2, Gurugram, Haryana - 122002"
                required
              />
            </div>

            {/* Mobile Number */}
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label">
                Mobile Number <span className="req">*</span>
              </label>
              <input
                type="text"
                name="mobile_number"
                className="form-control"
                value={formData.mobile_number}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                required
              />
            </div>
          </div>

          <div className="card-header" style={{ justifyContent: 'flex-end', backgroundColor: '#f8fafc' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Company Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Database Status Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2>Database Status</h2>
            <p>MySQL connection health check</p>
          </div>
          <button className="icon-btn" onClick={loadData} title="Check Connection">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="card-body">
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: dbStatus?.isMySQL ? '#ecfdf5' : '#fffbeb',
              border: `1px solid ${dbStatus?.isMySQL ? '#a7f3d0' : '#fde68a'}`,
              marginBottom: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', color: dbStatus?.isMySQL ? '#065f46' : '#92400e' }}>
              <Database size={16} />
              {dbStatus?.isMySQL ? 'MySQL Database is Active' : 'Operating in Resilient Mode'}
            </div>
            <div style={{ fontSize: '12px', marginTop: '6px', color: dbStatus?.isMySQL ? '#047857' : '#b45309' }}>
              {dbStatus?.isMySQL
                ? `Connected to MySQL database "${dbStatus.database}" on ${dbStatus.host}.`
                : `Operating in in-memory mode. Company settings and logo are active.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
