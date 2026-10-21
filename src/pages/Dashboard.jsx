/**
 * @file Dashboard.jsx
 * @description Executive Dashboard overviewing workforce KPIs, department distribution,
 * and recent salary disbursement activity.
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  IndianRupee,
  FileText,
  ArrowUpRight,
  TrendingUp,
  Building,
  Eye,
  Printer,
  Lock
} from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { payrollService } from '../services/payrollService';
import { formatCurrency, getMonthName, formatDate } from '../utils/formatters';

export default function Dashboard({ onNavigate, onPreviewSlip, showToast }) {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departmentDistribution: {},
    totalMonthlyBasePayroll: 0
  });

  const [payrollSummary, setPayrollSummary] = useState({
    count: 0,
    totalGross: 0,
    totalDeductions: 0,
    totalNet: 0
  });

  const [recentSlips, setRecentSlips] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [empStats, payrollSum, slips] = await Promise.all([
        employeeService.getStats(),
        payrollService.getSummary({ month: currentMonth, year: currentYear }),
        payrollService.getPayrolls({ limit: 5 })
      ]);

      setStats(empStats);
      setPayrollSummary(payrollSum);
      setRecentSlips(slips.slice(0, 5));
    } catch (err) {
      showToast('Failed to load dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* 1. Metric Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Employees</span>
            <span className="stat-value">{stats.totalEmployees}</span>
            <span className="stat-subtext" style={{ color: 'var(--color-success)' }}>
              ● {stats.activeEmployees} Active on payroll
            </span>
          </div>
          <div className="stat-icon-box stat-icon-blue">
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Est. Monthly Payroll</span>
            <span className="stat-value">{formatCurrency(stats.totalMonthlyBasePayroll)}</span>
            <span className="stat-subtext">Sum of active base salaries</span>
          </div>
          <div className="stat-icon-box stat-icon-green">
            <IndianRupee size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">{getMonthName(currentMonth)} Net Disbursed</span>
            <span className="stat-value">{formatCurrency(payrollSummary.totalNet)}</span>
            <span className="stat-subtext">{payrollSummary.count} payslips generated</span>
          </div>
          <div className="stat-icon-box stat-icon-amber">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Tax & Deductions</span>
            <span className="stat-value">{formatCurrency(payrollSummary.totalDeductions)}</span>
            <span className="stat-subtext">PF, PT, TDS withheld</span>
          </div>
          <div className="stat-icon-box stat-icon-purple">
            <FileText size={24} />
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Quick Actions & Department Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Quick Launchpad */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Common payroll operations and employee onboarding</p>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => onNavigate('payroll')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Generate Monthly Payslips</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Calculate earnings, deductions and issue PDF slips</div>
                </div>
              </div>
              <ArrowUpRight size={18} color="var(--text-muted)" />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => onNavigate('employees')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Manage Employee Directory</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Add employees, view profiles, and manage salary structure</div>
                </div>
              </div>
              <ArrowUpRight size={18} color="var(--text-muted)" />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => onNavigate('settings')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Customize Company Letterhead</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Set company details and authorized signatures</div>
                </div>
              </div>
              <ArrowUpRight size={18} color="var(--text-muted)" />
            </div>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Workforce by Role</h2>
              <p>Employees grouped by their role</p>
            </div>
          </div>
          <div className="card-body">
            {Object.keys(stats.departmentDistribution || {}).length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>
                No role data available
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Object.entries(stats.departmentDistribution).map(([roleName, count]) => {
                  const percent = Math.round((count / (stats.totalEmployees || 1)) * 100);
                  return (
                    <div key={roleName}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        <span>{roleName}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{count} staff ({percent}%)</span>
                      </div>
                      <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${percent}%`,
                            background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
                            borderRadius: '99px'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Recent Payslips Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2>Recent Salary Slips</h2>
            <p>Recently generated payroll records and disbursements</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => onNavigate('payroll')}>
            View All Slips
          </button>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Slip No.</th>
                <th>Employee</th>
                <th>Month / Year</th>
                <th>Gross Earnings</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentSlips.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No salary slips have been generated yet.
                  </td>
                </tr>
              ) : (
                recentSlips.map(slip => (
                  <tr key={slip.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)' }}>
                        {slip.slip_number}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{slip.employee_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{slip.employee_code} • {slip.role || slip.designation || 'Staff'}</div>
                    </td>
                    <td>{getMonthName(slip.month)} {slip.year}</td>
                    <td>{formatCurrency(slip.gross_earnings)}</td>
                    <td style={{ color: '#dc2626' }}>{formatCurrency(slip.total_deductions)}</td>
                    <td>
                      <strong style={{ color: '#059669' }}>{formatCurrency(slip.net_salary)}</strong>
                    </td>
                    <td>
                      <span className="badge badge-paid" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={11} /> Issued & Locked
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onPreviewSlip(slip)}
                        title="View Official Salary Slip"
                      >
                        <Eye size={13} />
                        View Slip
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
