/**
 * @file EmployeeModal.jsx
 * @description Modal for creating and editing employee profiles.
 * Features:
 * - Job and Role (Employee Code, Employee Name, Role, Department, Date of Joining)
 * - Salary Structure (Basic Salary, HRA, Conveyance Allowance)
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Briefcase, IndianRupee } from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import { formatCurrency } from '../../utils/formatters';

export default function EmployeeModal({ isOpen, onClose, employee, onSaved, showToast }) {
  const [activeTab, setActiveTab] = useState('job'); // 'job' | 'salary'
  const [loading, setLoading] = useState(false);

  const initialForm = {
    employee_code: '',
    employee_name: '',
    date_of_joining: new Date().toISOString().slice(0, 10),
    role: '',
    department: 'Engineering',
    basic_salary: 50000,
    hra: 20000,
    conveyance_allowance: 3000
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (employee) {
      const empName = employee.employee_name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
      setFormData({
        employee_code: employee.employee_code || '',
        employee_name: empName,
        date_of_joining: employee.date_of_joining ? String(employee.date_of_joining).slice(0, 10) : new Date().toISOString().slice(0, 10),
        role: employee.role || employee.designation || '',
        department: employee.department || 'Engineering',
        basic_salary: Number(employee.basic_salary) || 0,
        hra: Number(employee.hra !== undefined ? employee.hra : employee.rent_allowance) || 0,
        conveyance_allowance: Number(employee.conveyance_allowance !== undefined ? employee.conveyance_allowance : employee.medical_allowance) || 0
      });
    } else {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setFormData({
        ...initialForm,
        employee_code: `EMP-${randomSuffix}`
      });
    }
    setActiveTab('job');
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  // Total Salary calculation (Basic + HRA + Conveyance)
  const totalSalary =
    (Number(formData.basic_salary) || 0) +
    (Number(formData.hra) || 0) +
    (Number(formData.conveyance_allowance) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_code.trim()) {
      showToast('Employee Code is required', 'error');
      return;
    }
    if (!formData.employee_name.trim()) {
      showToast('Employee Name is required', 'error');
      return;
    }
    if (!formData.role.trim()) {
      showToast('Role is required', 'error');
      return;
    }
    if (!formData.department.trim()) {
      showToast('Department is required', 'error');
      return;
    }
    if (!formData.date_of_joining) {
      showToast('Date of Joining is required', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        designation: formData.role,
        department: formData.department.trim(),
        rent_allowance: formData.hra,
        medical_allowance: formData.conveyance_allowance,
        first_name: formData.employee_name.split(' ')[0] || formData.employee_name,
        last_name: formData.employee_name.split(' ').slice(1).join(' ') || ''
      };

      if (employee?.id) {
        await employeeService.updateEmployee(employee.id, payload);
        showToast('Employee updated successfully', 'success');
      } else {
        await employeeService.createEmployee(payload);
        showToast('Employee created successfully', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast(err.message || 'Error saving employee', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div>
            <h3>{employee ? 'Edit Employee Profile' : 'Add New Employee'}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {employee ? `Update details for ${employee.employee_code}` : 'Enter Job and Role & Salary Structure details'}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div style={{ padding: '0 28px', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-light)' }}>
          <div className="form-tabs" style={{ marginBottom: 0 }}>
            <button
              type="button"
              className={`form-tab-btn ${activeTab === 'job' ? 'active' : ''}`}
              onClick={() => setActiveTab('job')}
            >
              <Briefcase size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Job and Role
            </button>
            <button
              type="button"
              className={`form-tab-btn ${activeTab === 'salary' ? 'active' : ''}`}
              onClick={() => setActiveTab('salary')}
            >
              <IndianRupee size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Salary Structure
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* 1. Job and Role */}
            {activeTab === 'job' && (
              <div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Employee Code <span className="req">*</span></label>
                    <input
                      type="text"
                      name="employee_code"
                      className="form-control"
                      value={formData.employee_code}
                      onChange={handleChange}
                      placeholder="e.g. EMP-1001"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Employee Name <span className="req">*</span></label>
                    <input
                      type="text"
                      name="employee_name"
                      className="form-control"
                      value={formData.employee_name}
                      onChange={handleChange}
                      placeholder="e.g. Aarav Sharma"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Role <span className="req">*</span></label>
                    <input
                      type="text"
                      name="role"
                      className="form-control"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="e.g. Lead Software Architect"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department <span className="req">*</span></label>
                    <input
                      type="text"
                      name="department"
                      list="department-suggestions"
                      className="form-control"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Engineering, Product Design, Finance, HR"
                      required
                    />
                    <datalist id="department-suggestions">
                      <option value="Engineering" />
                      <option value="Product Design" />
                      <option value="Finance" />
                      <option value="Human Resources" />
                      <option value="Sales & Marketing" />
                      <option value="Operations" />
                      <option value="Information Technology" />
                    </datalist>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Date of Joining <span className="req">*</span></label>
                  <input
                    type="date"
                    name="date_of_joining"
                    className="form-control"
                    value={formData.date_of_joining}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {/* 2. Salary Structure (strictly: Basic Salary, HRA, Conveyance Allowance) */}
            {activeTab === 'salary' && (
              <div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Basic Salary (₹) <span className="req">*</span></label>
                  <input
                    type="number"
                    name="basic_salary"
                    className="form-control"
                    value={formData.basic_salary}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g. 50000"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">HRA (₹)</label>
                  <input
                    type="number"
                    name="hra"
                    className="form-control"
                    value={formData.hra}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g. 20000"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Conveyance Allowance (₹)</label>
                  <input
                    type="number"
                    name="conveyance_allowance"
                    className="form-control"
                    value={formData.conveyance_allowance}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g. 3000"
                  />
                </div>

                {/* Total Salary Summary Box */}
                <div
                  style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#065f46' }}>
                    Total Monthly Salary:
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
                    {formatCurrency(totalSalary)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} />
              {loading ? 'Saving...' : employee ? 'Update Employee' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
