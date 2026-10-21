/**
 * @file GeneratePayrollModal.jsx
 * @description Modal dialog for issuing an official employee payslip.
 * Workflow:
 * 1. Select the employee
 * 2. Enter the number of Salary Days
 * 3. Select the payslip month and year
 * 4. Click the "Issue Slip" button
 *
 * Automatically calculates pro-rated Basic Salary, HRA, and Conveyance Allowance
 * based on the employee's salary structure and entered Salary Days.
 * Guaranteed fixed-footer layout ensures "Cancel" and "Issue Slip" buttons
 * are always clearly visible and never clipped or hidden.
 */

import React, { useState, useEffect } from 'react';
import { X, Calculator, CheckCircle, UserCheck, Calendar, Clock } from 'lucide-react';
import { payrollService } from '../../services/payrollService';
import { formatCurrency, getMonthName } from '../../utils/formatters';

export default function GeneratePayrollModal({
  isOpen,
  onClose,
  employees,
  preselectedEmployee,
  onGenerated,
  showToast
}) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const initialDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const [leaveDays, setLeaveDays] = useState(0);
  const [monthDays, setMonthDays] = useState(initialDaysInMonth);

  const [formData, setFormData] = useState({
    employee_id: '',
    month: currentMonth,
    year: currentYear,
    salary_days: initialDaysInMonth,
    total_days: initialDaysInMonth
  });

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [calculationPreview, setCalculationPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Auto-Attendance: Sync monthDays and recalculate salary_days when Month or Year changes
  useEffect(() => {
    if (formData.month && formData.year) {
      const daysInM = new Date(Number(formData.year), Number(formData.month), 0).getDate();
      setMonthDays(daysInM);
      const computed = Math.max(0, daysInM - (Number(leaveDays) || 0));
      setFormData(prev => ({
        ...prev,
        salary_days: computed,
        total_days: daysInM
      }));
    }
  }, [formData.month, formData.year]);

  const handleLeaveDaysChange = (val) => {
    setLeaveDays(val);
    const leaves = val === '' ? 0 : Number(val);
    const mDays = Number(monthDays) || 30;
    const computed = Math.max(0, mDays - leaves);
    setFormData(prev => ({ ...prev, salary_days: computed }));
  };

  const handleMonthDaysChange = (val) => {
    setMonthDays(val);
    const mDays = val === '' ? 30 : Number(val);
    const leaves = Number(leaveDays) || 0;
    const computed = Math.max(0, mDays - leaves);
    setFormData(prev => ({ ...prev, salary_days: computed, total_days: mDays }));
  };

  // Sync preselected employee or initialize with first employee
  useEffect(() => {
    if (!isOpen) return;

    if (preselectedEmployee?.id) {
      setFormData(prev => ({ ...prev, employee_id: preselectedEmployee.id }));
      setSelectedEmployee(preselectedEmployee);
    } else if (employees && employees.length > 0 && !formData.employee_id) {
      const firstEmp = employees[0];
      setFormData(prev => ({ ...prev, employee_id: firstEmp.id }));
      setSelectedEmployee(firstEmp);
    }
  }, [isOpen, preselectedEmployee, employees]);

  // Update selected employee reference whenever employee_id changes
  useEffect(() => {
    if (formData.employee_id && employees) {
      const emp = employees.find(e => Number(e.id) === Number(formData.employee_id));
      setSelectedEmployee(emp || null);
    }
  }, [formData.employee_id, employees]);

  // Live calculation preview
  useEffect(() => {
    if (!formData.employee_id || !isOpen) return;

    const timer = setTimeout(async () => {
      try {
        setPreviewLoading(true);
        const days = Number(formData.salary_days) || 0;
        const payload = {
          ...formData,
          working_days: days,
          days_worked: days,
          total_days: Number(formData.total_days) || 30
        };
        const res = await payrollService.previewPayroll(payload);
        setCalculationPreview(res.calculation);
      } catch (err) {
        console.error('Preview error:', err);
      } finally {
        setPreviewLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [formData.employee_id, formData.month, formData.year, formData.salary_days, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  // Quick helper values for the selected employee's base package
  const empName = selectedEmployee
    ? selectedEmployee.employee_name || `${selectedEmployee.first_name || ''} ${selectedEmployee.last_name || ''}`.trim()
    : '';
  const empRole = selectedEmployee?.role || selectedEmployee?.designation || 'Staff';
  const baseBasic = Number(selectedEmployee?.basic_salary) || 0;
  const baseHra = Number(selectedEmployee?.hra !== undefined ? selectedEmployee?.hra : selectedEmployee?.rent_allowance) || 0;
  const baseConveyance = Number(selectedEmployee?.conveyance_allowance !== undefined ? selectedEmployee?.conveyance_allowance : selectedEmployee?.medical_allowance) || 0;
  const baseTotal = baseBasic + baseHra + baseConveyance;

  const enteredSalaryDays = Number(formData.salary_days) || 0;
  const totalDays = Number(formData.total_days) || 30;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_id) {
      showToast('Please select an employee', 'error');
      return;
    }

    if (formData.salary_days === '' || Number(formData.salary_days) < 0) {
      showToast('Please enter a valid number of Salary Days', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        employee_id: formData.employee_id,
        month: Number(formData.month),
        year: Number(formData.year),
        working_days: enteredSalaryDays,
        days_worked: enteredSalaryDays,
        salary_days: enteredSalaryDays,
        total_days: totalDays,
        payment_method: 'Bank Transfer',
        payment_date: new Date().toISOString().slice(0, 10)
      };

      const generated = await payrollService.generatePayroll(payload);
      showToast(
        `Payslip successfully issued to ${empName} for ${getMonthName(formData.month)} ${formData.year}`,
        'success'
      );
      onGenerated(generated);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to issue payslip', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '640px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ flexShrink: 0, padding: '16px 24px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Issue Payslip</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Select employee, enter Salary Days, and click Issue Slip to generate and save payslip
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
            {/* 1. Select the Employee */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={14} color="var(--color-primary)" />
                Select Employee <span className="req">*</span>
              </label>
              <select
                name="employee_id"
                className="form-select"
                value={formData.employee_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose Employee --</option>
                {employees && employees.map(emp => {
                  const name = emp.employee_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Employee';
                  const role = emp.role || emp.designation || 'Staff';
                  return (
                    <option key={emp.id} value={emp.id}>
                      {emp.employee_code} - {name} ({role})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Selected Employee Salary Structure Summary Card */}
            {selectedEmployee && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                    {empName} <span style={{ color: '#64748b', fontWeight: 500 }}>({empRole})</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                    Full Monthly Base: {formatCurrency(baseTotal)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11px' }}>
                  <div style={{ background: '#ffffff', padding: '5px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Basic:</span> <strong>{formatCurrency(baseBasic)}</strong>
                  </div>
                  <div style={{ background: '#ffffff', padding: '5px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>HRA:</span> <strong>{formatCurrency(baseHra)}</strong>
                  </div>
                  <div style={{ background: '#ffffff', padding: '5px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Conveyance:</span> <strong>{formatCurrency(baseConveyance)}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Select Payslip Month & Year */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '12px'
              }}
            >
              {/* Payslip Month */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={13} color="var(--color-primary)" />
                  Target Month <span className="req">*</span>
                </label>
                <select
                  name="month"
                  className="form-select"
                  value={formData.month}
                  onChange={handleChange}
                  required
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>
                      {getMonthName(m)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payslip Year */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={13} color="var(--color-primary)" />
                  Year <span className="req">*</span>
                </label>
                <select
                  name="year"
                  className="form-select"
                  value={formData.year}
                  onChange={handleChange}
                  required
                >
                  {['2024', '2025', '2026', '2027', '2028'].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Auto-Attendance & Leave Calculator */}
            <div
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} color="var(--color-primary)" />
                  Auto-Attendance Calculator
                </span>
                <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                  {formData.salary_days} Days Payable
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '10px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px' }}>Total Month Days</label>
                  <input
                    type="number"
                    className="form-control"
                    value={monthDays}
                    min="1"
                    max="31"
                    onChange={(e) => handleMonthDaysChange(e.target.value)}
                    style={{ height: '34px', fontSize: '12px' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', color: '#b91c1c' }}>Leave / LOP Days</label>
                  <input
                    type="number"
                    className="form-control"
                    value={leaveDays}
                    min="0"
                    max="31"
                    step="0.5"
                    onChange={(e) => handleLeaveDaysChange(e.target.value)}
                    placeholder="0"
                    style={{ height: '34px', fontSize: '12px' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Salary Days (Payable)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="salary_days"
                    value={formData.salary_days}
                    onChange={handleChange}
                    min="0"
                    max="31"
                    step="0.5"
                    required
                    style={{ height: '34px', fontSize: '12px', fontWeight: 700, color: '#059669', backgroundColor: '#ffffff' }}
                  />
                </div>
              </div>

              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                Formula: <strong>{monthDays}</strong> Month Days − <strong>{leaveDays || 0}</strong> Leaves = <strong style={{ color: '#059669' }}>{formData.salary_days}</strong> Salary Days
              </div>
            </div>

            {/* 3. Automatic Salary Calculation Breakdown (Basic Salary, HRA, Conveyance Allowance) */}
            {calculationPreview && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginTop: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                    <Calculator size={15} color="var(--color-primary)" />
                    Calculated Salary Breakdown ({enteredSalaryDays} Salary Days)
                  </div>
                  {previewLoading && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Calculating...</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      Basic Salary
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {formatCurrency(calculationPreview.basic_pay)}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      HRA
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {formatCurrency(calculationPreview.hra_pay !== undefined ? calculationPreview.hra_pay : calculationPreview.rent_pay)}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      Conveyance Allowance
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {formatCurrency(calculationPreview.conveyance_pay !== undefined ? calculationPreview.conveyance_pay : calculationPreview.medical_pay)}
                    </div>
                  </div>
                </div>

                {/* Net Take-Home Salary Banner */}
                <div
                  style={{
                    background: '#ecfdf5',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid #a7f3d0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '10px', color: '#065f46', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Net Take-Home Salary
                    </div>
                    <div style={{ fontSize: '10px', color: '#15803d', fontStyle: 'italic', marginTop: '2px' }}>
                      {calculationPreview.net_salary_in_words}
                    </div>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>
                    {formatCurrency(calculationPreview.net_salary)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Action Buttons Footer: ALWAYS pinned at bottom and 100% visible */}
          <div
            className="modal-footer"
            style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-light)',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              flexShrink: 0
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ minWidth: '90px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !formData.employee_id}
              style={{
                minWidth: '130px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
              }}
            >
              <CheckCircle size={16} />
              {loading ? 'Issuing...' : 'Issue Slip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
