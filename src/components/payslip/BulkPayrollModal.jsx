/**
 * @file BulkPayrollModal.jsx
 * @description Modal dialog for issuing payslips for all or multiple active employees
 * in a single bulk operation.
 * Features:
 * - Select target month and year
 * - Global default salary days with one-click apply to all
 * - Per-employee salary days customization
 * - Real-time total disbursement preview
 * - Batch issuance with database persistence
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  CheckSquare,
  Square,
  CheckCircle,
  Calendar,
  Clock,
  IndianRupee,
  Loader2
} from 'lucide-react';
import { payrollService } from '../../services/payrollService';
import { formatCurrency, getMonthName } from '../../utils/formatters';

export default function BulkPayrollModal({
  isOpen,
  onClose,
  employees = [],
  onBulkGenerated,
  showToast
}) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [defaultDays, setDefaultDays] = useState(30);
  const [selectedIds, setSelectedIds] = useState([]);
  const [customDays, setCustomDays] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize selected employees and custom days when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const activeEmps = employees.filter(e => (e.status || 'Active') === 'Active');
    const ids = activeEmps.map(e => e.id);
    setSelectedIds(ids);

    const daysInM = new Date(selectedYear, selectedMonth, 0).getDate();
    const daysMap = {};
    activeEmps.forEach(e => {
      daysMap[e.id] = daysInM;
    });
    setCustomDays(daysMap);
    setDefaultDays(daysInM);
  }, [isOpen, employees, selectedMonth, selectedYear]);

  if (!isOpen) return null;

  const activeEmployees = employees.filter(e => (e.status || 'Active') === 'Active');

  const handleToggleAll = () => {
    if (selectedIds.length === activeEmployees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(activeEmployees.map(e => e.id));
    }
  };

  const handleToggleOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCustomDaysChange = (id, val) => {
    const num = val === '' ? '' : Number(val);
    setCustomDays(prev => ({
      ...prev,
      [id]: num
    }));
  };

  const handleApplyDefaultToAll = () => {
    const num = Number(defaultDays) || 30;
    const updated = {};
    activeEmployees.forEach(e => {
      updated[e.id] = num;
    });
    setCustomDays(updated);
    showToast(`Applied ${num} Salary Days to all employees`, 'info');
  };

  // Calculate live preview totals for selected employees
  let totalDisbursement = 0;
  selectedIds.forEach(id => {
    const emp = activeEmployees.find(e => e.id === id);
    if (emp) {
      const basic = Number(emp.basic_salary) || 0;
      const hra = Number(emp.hra !== undefined ? emp.hra : emp.rent_allowance) || 0;
      const conv = Number(emp.conveyance_allowance !== undefined ? emp.conveyance_allowance : emp.medical_allowance) || 0;
      const fullBase = basic + hra + conv;
      const days = Number(customDays[id]) || 0;
      const prorated = fullBase * (days / 30);
      totalDisbursement += prorated;
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      showToast('Please select at least one employee', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        month: Number(selectedMonth),
        year: Number(selectedYear),
        default_salary_days: Number(defaultDays) || 30,
        employee_ids: selectedIds,
        custom_days: customDays,
        payment_method: 'Bank Transfer'
      };

      const res = await payrollService.bulkGeneratePayroll(payload);
      showToast(
        `Successfully issued ${res.count} payslips for ${getMonthName(selectedMonth)} ${selectedYear}`,
        'success'
      );
      if (onBulkGenerated) onBulkGenerated(res);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to issue bulk payslips', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box large"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '860px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ flexShrink: 0, padding: '16px 24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--color-primary)" />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Run Monthly Payroll / Bulk Issue</h3>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Generate, issue, and save salary slips for all active workforce members in a single click
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {/* Form wrapping body and footer */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
          {/* Scrollable Body */}
          <div
            className="modal-body"
            style={{
              padding: '18px 24px',
              overflowY: 'auto',
              flex: 1,
              minHeight: 0
            }}
          >
            {/* Top Config Controls Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr 1.2fr auto',
                gap: '12px',
                alignItems: 'flex-end',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}
            >
              {/* Month */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={13} color="var(--color-primary)" />
                  Target Month <span className="req">*</span>
                </label>
                <select
                  className="form-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>
                      {getMonthName(m)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={13} color="var(--color-primary)" />
                  Year <span className="req">*</span>
                </label>
                <select
                  className="form-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {['2024', '2025', '2026', '2027', '2028'].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Default Days */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={13} color="var(--color-primary)" />
                  Default Salary Days
                </label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  max="31"
                  step="0.5"
                  value={defaultDays}
                  onChange={(e) => setDefaultDays(e.target.value)}
                />
              </div>

              {/* Apply All Button */}
              <div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleApplyDefaultToAll}
                  style={{ height: '40px', whiteSpace: 'nowrap' }}
                >
                  Apply to All
                </button>
              </div>
            </div>

            {/* Employee Selection Table */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  backgroundColor: '#f1f5f9',
                  borderBottom: '1px solid #e2e8f0',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={handleToggleAll}>
                  {selectedIds.length === activeEmployees.length ? (
                    <CheckSquare size={16} color="var(--color-primary)" />
                  ) : (
                    <Square size={16} color="var(--text-muted)" />
                  )}
                  <span>Select All ({selectedIds.length}/{activeEmployees.length} Selected)</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                  Modify individual salary days if required
                </span>
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                <table className="data-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}></th>
                      <th>Employee</th>
                      <th>Department & Role</th>
                      <th>Base Total</th>
                      <th style={{ width: '130px' }}>Salary Days</th>
                      <th style={{ textAlign: 'right' }}>Est. Net Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          No active employees available.
                        </td>
                      </tr>
                    ) : (
                      activeEmployees.map(emp => {
                        const isSelected = selectedIds.includes(emp.id);
                        const empName = emp.employee_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Employee';
                        const basic = Number(emp.basic_salary) || 0;
                        const hra = Number(emp.hra !== undefined ? emp.hra : emp.rent_allowance) || 0;
                        const conv = Number(emp.conveyance_allowance !== undefined ? emp.conveyance_allowance : emp.medical_allowance) || 0;
                        const fullBase = basic + hra + conv;
                        const days = customDays[emp.id] !== undefined ? customDays[emp.id] : defaultDays;
                        const proratedNet = fullBase * ((Number(days) || 0) / 30);

                        return (
                          <tr
                            key={emp.id}
                            style={{
                              backgroundColor: isSelected ? '#ffffff' : '#f8fafc',
                              opacity: isSelected ? 1 : 0.6
                            }}
                          >
                            <td style={{ textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleOne(emp.id)}
                                style={{ cursor: 'pointer' }}
                              />
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{empName}</div>
                              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-primary)' }}>
                                {emp.employee_code}
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-dept" style={{ fontSize: '10px', padding: '2px 6px', marginRight: '6px' }}>
                                {emp.department || 'General'}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {emp.role || emp.designation || 'Staff'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '12px' }}>{formatCurrency(fullBase)}</span>
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                min="0"
                                max="31"
                                step="0.5"
                                value={days}
                                disabled={!isSelected}
                                onChange={(e) => handleCustomDaysChange(emp.id, e.target.value)}
                                style={{ height: '32px', fontSize: '12px', padding: '0 8px' }}
                              />
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <strong style={{ color: '#059669', fontSize: '13px' }}>
                                {formatCurrency(proratedNet)}
                              </strong>
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

          {/* Footer with Summary and Action Button: Always Visible & Pinned */}
          <div
            className="modal-footer"
            style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-light)',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                {selectedIds.length} Employees Selected
              </span>
              <span style={{ color: 'var(--border-medium)' }}>•</span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Total Est. Net:{' '}
                <strong style={{ color: '#059669', fontSize: '14px' }}>
                  {formatCurrency(totalDisbursement)}
                </strong>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || selectedIds.length === 0}
                style={{
                  minWidth: '160px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Issuing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Issue {selectedIds.length} Payslips
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
