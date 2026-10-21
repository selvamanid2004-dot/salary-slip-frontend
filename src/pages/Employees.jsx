/**
 * @file Employees.jsx
 * @description Employee Directory interface.
 * Shows Employee Code, Employee Name, Date of Joining, Role,
 * Basic Salary, Rent Allowance, and Medical Allowance.
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, FileText, FileSpreadsheet } from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function Employees({
  onAddEmployee,
  onEditEmployee,
  onGenerateForEmployee,
  onOpenAnnualStatement,
  showToast,
  refreshTrigger
}) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEmployees();
  }, [searchTerm, refreshTrigger]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getEmployees({
        search: searchTerm
      });
      setEmployees(data);
    } catch (err) {
      showToast('Failed to load employee list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete employee "${name}"? This will also remove associated payroll slips.`)) {
      try {
        await employeeService.deleteEmployee(id);
        showToast('Employee deleted successfully', 'success');
        loadEmployees();
      } catch (err) {
        showToast(err.message || 'Failed to delete employee', 'error');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      {/* 1. Search & Add Employee Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Search by Employee Code, Name, Department, or Role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>

            <button className="btn btn-primary" onClick={onAddEmployee}>
              <Plus size={16} />
              Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* 2. Employee Directory Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2>Employees ({employees.length})</h2>
            <p>Job and Role profiles and Salary Structure</p>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Role</th>
                <th>Date of Joining</th>
                <th>Basic Salary</th>
                <th>HRA</th>
                <th>Conveyance Allowance</th>
                <th>Total Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    {loading ? 'Loading employees...' : 'No employees matched your search.'}
                  </td>
                </tr>
              ) : (
                employees.map(emp => {
                  const empName = emp.employee_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Employee';
                  const empRole = emp.role || emp.designation || 'Staff';
                  const basic = Number(emp.basic_salary) || 0;
                  const hra = Number(emp.hra !== undefined ? emp.hra : emp.rent_allowance) || 0;
                  const conveyance = Number(emp.conveyance_allowance !== undefined ? emp.conveyance_allowance : emp.medical_allowance) || 0;
                  const total = basic + hra + conveyance;

                  return (
                    <tr key={emp.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)' }}>
                          {emp.employee_code}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{empName}</div>
                      </td>
                      <td>
                        <span className="badge badge-dept">
                          {emp.department || 'General'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                          {empRole}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {formatDate(emp.date_of_joining)}
                      </td>
                      <td>{formatCurrency(basic)}</td>
                      <td>{formatCurrency(hra)}</td>
                      <td>{formatCurrency(conveyance)}</td>
                      <td>
                        <strong style={{ color: '#059669', fontSize: '13px' }}>
                          {formatCurrency(total)}
                        </strong>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => onGenerateForEmployee(emp)}
                            title="Generate Salary Slip for this employee"
                          >
                            <FileText size={13} />
                            Issue Slip
                          </button>
                          {onOpenAnnualStatement && (
                            <button
                              className="icon-btn"
                              onClick={() => onOpenAnnualStatement(emp.id)}
                              title="Annual Salary Statement"
                              style={{ color: 'var(--color-primary)' }}
                            >
                              <FileSpreadsheet size={15} />
                            </button>
                          )}
                          <button
                            className="icon-btn"
                            onClick={() => onEditEmployee(emp)}
                            title="Edit Employee"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="icon-btn danger"
                            onClick={() => handleDelete(emp.id, empName)}
                            title="Delete Employee"
                          >
                            <Trash2 size={14} />
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
