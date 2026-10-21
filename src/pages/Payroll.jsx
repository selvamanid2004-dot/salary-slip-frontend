/**
 * @file Payroll.jsx
 * @description Monthly Payroll & Issued Salary Slips Archive.
 * Provides multi-month historical records, filtering by Employee, Month, and Year,
 * duplicate prevention, and viewing/downloading of permanently locked payslips.
 */

import React, { useState, useEffect } from 'react';
import {
  ReceiptText,
  Plus,
  Eye,
  Printer,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
  Lock,
  Search,
  Filter,
  RotateCcw,
  UserCheck,
  Download,
  Users
} from 'lucide-react';
import { payrollService } from '../services/payrollService';
import { formatCurrency, getMonthName } from '../utils/formatters';

export default function Payroll({
  employees = [],
  onOpenGenerateModal,
  onOpenBulkModal,
  onOpenAnnualStatement,
  onPreviewSlip,
  showToast,
  refreshTrigger
}) {
  const currentDate = new Date();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(String(currentDate.getFullYear()));
  const [searchTerm, setSearchTerm] = useState('');
  const [payrolls, setPayrolls] = useState([]);
  const [summary, setSummary] = useState({ count: 0, totalGross: 0, totalDeductions: 0, totalNet: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayrollData();
  }, [selectedEmployee, selectedMonth, selectedYear, refreshTrigger]);

  const loadPayrollData = async () => {
    try {
      setLoading(true);
      const [list, sum] = await Promise.all([
        payrollService.getPayrolls({
          employee_id: selectedEmployee || undefined,
          month: selectedMonth || undefined,
          year: selectedYear || undefined
        }),
        payrollService.getSummary({
          month: selectedMonth || undefined,
          year: selectedYear || undefined
        })
      ]);

      setPayrolls(list);
      setSummary(sum);
    } catch (err) {
      showToast('Failed to load payroll records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedEmployee('');
    setSelectedMonth('');
    setSelectedYear(String(currentDate.getFullYear()));
    setSearchTerm('');
  };

  // Client-side search filtering by employee name, code, role, or department
  const filteredPayrolls = payrolls.filter(slip => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const name = (slip.employee_name || '').toLowerCase();
    const code = (slip.employee_code || '').toLowerCase();
    const dept = (slip.department || '').toLowerCase();
    const role = (slip.role || slip.designation || '').toLowerCase();
    const slipNo = (slip.slip_number || '').toLowerCase();
    return name.includes(term) || code.includes(term) || dept.includes(term) || role.includes(term) || slipNo.includes(term);
  });

  return (
    <div className="animate-fade-in">
      {/* 1. Monthly & Employee Filters Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Filter By Employee */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={16} color="var(--color-primary)" />
                <select
                  className="form-select"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  style={{ minWidth: '190px' }}
                >
                  <option value="">All Employees</option>
                  {employees && employees.map((emp) => {
                    const empName = emp.employee_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Employee';
                    return (
                      <option key={emp.id} value={emp.id}>
                        {emp.employee_code} - {empName}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Filter By Month */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} color="var(--color-primary)" />
                <select
                  className="form-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{ minWidth: '140px' }}
                >
                  <option value="">All Months</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {getMonthName(m)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter By Year */}
              <div>
                <select
                  className="form-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{ minWidth: '110px' }}
                >
                  <option value="">All Years</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>

              {/* Quick Search Input */}
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search
                  size={15}
                  style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search name, ID, role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '32px', fontSize: '13px' }}
                />
              </div>

              {/* Reset Filters */}
              {(selectedEmployee || selectedMonth || selectedYear !== String(currentDate.getFullYear()) || searchTerm) && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleResetFilters}
                  title="Reset filters to default"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <RotateCcw size={13} />
                  Reset
                </button>
              )}
            </div>

            {/* Actions Button Group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <a
                className="btn btn-outline"
                href={payrollService.getExportCsvUrl({
                  month: selectedMonth || undefined,
                  year: selectedYear || undefined,
                  employee_id: selectedEmployee || undefined
                })}
                download
                title="Download CSV report of filtered payroll disbursement records"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={15} />
                Export CSV
              </a>

              {onOpenAnnualStatement && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => onOpenAnnualStatement(selectedEmployee || null)}
                  title="View 12-month annual salary statement for an employee"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <FileSpreadsheet size={15} />
                  Annual Statement
                </button>
              )}

              <button
                type="button"
                className="btn btn-secondary"
                onClick={onOpenBulkModal}
                title="Batch generate payslips for all active employees"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Users size={15} />
                Run Monthly Payroll
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={onOpenGenerateModal}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} />
                Issue Payslip
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Monthly Disbursement Summary */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Permanent Issued Slips</span>
            <span className="stat-value">{payrolls.length}</span>
            <span className="stat-subtext">Archived in database</span>
          </div>
          <div className="stat-icon-box stat-icon-blue">
            <ReceiptText size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Basic Salary</span>
            <span className="stat-value" style={{ color: '#1d4ed8' }}>
              {formatCurrency(
                payrolls.reduce((acc, p) => acc + (Number(p.basic_pay) || 0), 0)
              )}
            </span>
            <span className="stat-subtext">Base compensation</span>
          </div>
          <div className="stat-icon-box stat-icon-amber">
            <FileSpreadsheet size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Allowances (HRA + Conveyance)</span>
            <span className="stat-value" style={{ color: '#8b5cf6' }}>
              {formatCurrency(
                payrolls.reduce((acc, p) => acc + (Number(p.hra_pay !== undefined ? p.hra_pay : p.rent_pay) || 0) + (Number(p.conveyance_pay !== undefined ? p.conveyance_pay : p.medical_pay) || 0), 0)
              )}
            </span>
            <span className="stat-subtext">HRA & Conveyance Allowance</span>
          </div>
          <div className="stat-icon-box stat-icon-purple">
            <FileSpreadsheet size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Net Disbursed</span>
            <span className="stat-value" style={{ color: '#059669' }}>
              {formatCurrency(
                payrolls.reduce((acc, p) => acc + (Number(p.net_salary) || 0), 0)
              )}
            </span>
            <span className="stat-subtext">Final credited sum</span>
          </div>
          <div className="stat-icon-box stat-icon-green">
            <CheckCircle size={22} />
          </div>
        </div>
      </div>

      {/* 3. Monthly Payslip Archive Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2>
              Issued Payslip Records{' '}
              {selectedMonth ? `(${getMonthName(selectedMonth)} ${selectedYear})` : selectedYear ? `(${selectedYear})` : ''}
            </h2>
            <p>
              Permanent records locked upon issuance. Select any employee or month to view or download previous payslips.
            </p>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payslip Month</th>
                <th>Employee Details</th>
                <th>Salary Days</th>
                <th>Basic Salary</th>
                <th>HRA</th>
                <th>Conveyance Allowance</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayrolls.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '42px', color: 'var(--text-muted)' }}>
                    {loading
                      ? 'Loading permanent payslip records...'
                      : 'No issued payslips found matching your selection. Select an employee and month above or click "Issue Payslip".'}
                  </td>
                </tr>
              ) : (
                filteredPayrolls.map((slip) => {
                  const basic = Number(slip.basic_pay) || 0;
                  const hra = Number(slip.hra_pay !== undefined ? slip.hra_pay : slip.rent_pay) || 0;
                  const conveyance = Number(slip.conveyance_pay !== undefined ? slip.conveyance_pay : slip.medical_pay) || 0;
                  const salaryDays = slip.salary_days !== undefined ? slip.salary_days : slip.days_worked;

                  return (
                    <tr key={slip.id}>
                      {/* Payslip Month & Year */}
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} />
                          {getMonthName(slip.month)} {slip.year}
                        </div>
                      </td>

                      {/* Employee Details (Name, Code, Department, Role) */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{slip.employee_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{slip.employee_code}</span>
                          {slip.department && (
                            <span className="badge badge-dept" style={{ padding: '2px 6px', fontSize: '10px' }}>
                              {slip.department}
                            </span>
                          )}
                          <span>• {slip.role || slip.designation || 'Staff'}</span>
                        </div>
                      </td>

                      {/* Salary Days */}
                      <td>
                        <strong style={{ color: '#0f172a', fontSize: '13px' }}>
                          {salaryDays} Days
                        </strong>
                      </td>

                      {/* Basic Salary */}
                      <td>{formatCurrency(basic)}</td>

                      {/* HRA */}
                      <td>{formatCurrency(hra)}</td>

                      {/* Conveyance Allowance */}
                      <td>{formatCurrency(conveyance)}</td>

                      {/* Net Salary */}
                      <td>
                        <strong style={{ color: '#059669', fontSize: '14px', fontWeight: 800 }}>
                          {formatCurrency(slip.net_salary)}
                        </strong>
                      </td>

                      {/* Lock Status */}
                      <td>
                        <span
                          className="badge badge-paid"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600,
                            fontSize: '11px'
                          }}
                          title="This payslip is permanently issued and locked against modifications"
                        >
                          <Lock size={11} />
                          Issued & Locked
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => onPreviewSlip(slip)}
                            title="View & Download Official PDF"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                          >
                            <Eye size={13} />
                            View Slip
                          </button>
                          <a
                            className="icon-btn"
                            href={payrollService.getPrintHtmlUrl(slip.id)}
                            target="_blank"
                            rel="noreferrer"
                            title="Printable Fullpage HTML"
                          >
                            <Printer size={14} />
                          </a>
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
