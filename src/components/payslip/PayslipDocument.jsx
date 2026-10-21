/**
 * @file PayslipDocument.jsx
 * @description Formal salary slip document renderer.
 * Company Details:
 * - Company Name
 * - Address
 * - Mobile Number
 * - Company Logo (increased size)
 *
 * Employee Details:
 * - Employee Name
 * - Employee ID
 * - Department
 * - Role
 * - Salary Days
 *
 * Salary Breakdown:
 * - Basic Salary
 * - HRA
 * - Conveyance Allowance
 *
 * Slip Number and signature sections are removed.
 */

import React from 'react';
import { formatCurrency, getMonthName } from '../../utils/formatters';

export default function PayslipDocument({ payroll, employee, company }) {
  if (!payroll) return null;

  const emp = employee || payroll.employee || {};
  const comp = company || payroll.company || {
    company_name: 'Apex Global Technologies Ltd.',
    address: 'Tower 4, Cyber City Phase 2, Gurugram, Haryana - 122002',
    phone: '+91 124 458 9200',
    mobile_number: '+91 124 458 9200',
    logo_url: ''
  };

  const currencySymbol = comp.currency_symbol || '₹';
  const monthName = getMonthName(payroll.month);

  const empName = emp.employee_name || (emp.first_name ? `${emp.first_name} ${emp.last_name || ''}`.trim() : payroll.employee_name);
  const empId = emp.employee_code || payroll.employee_code;
  const empRole = emp.role || emp.designation || payroll.role || payroll.designation || 'Staff';
  const empDept = emp.department || payroll.department || 'General';

  const salaryDays = Number(
    payroll.salary_days !== undefined
      ? payroll.salary_days
      : payroll.days_worked !== undefined
      ? payroll.days_worked
      : payroll.total_working_days || 30
  );

  // 3 Salary Structure components
  const basicAmount = Number(payroll.basic_pay) || 0;
  const hraAmount = Number(payroll.hra_pay !== undefined ? payroll.hra_pay : payroll.rent_pay) || 0;
  const conveyanceAmount = Number(payroll.conveyance_pay !== undefined ? payroll.conveyance_pay : payroll.medical_pay) || 0;
  const grossEarnings = basicAmount + hraAmount + conveyanceAmount;
  const totalDeductions = Number(payroll.total_deductions) || 0;
  const netSalary = Math.max(0, grossEarnings - totalDeductions);

  const companyAddress = comp.address || comp.address_line1 || 'Company Address';
  const companyMobile = comp.mobile_number || comp.phone || '';

  return (
    <div
      className="payslip-print-target"
      id="payslip-document-to-export"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '36px',
        maxWidth: '820px',
        margin: '0 auto',
        color: '#0f172a',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* 1. Company Details Header (Logo, Company Name, Address, Mobile Number) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2px solid #0f172a',
          paddingBottom: '20px',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {/* Company Logo (increased size) */}
          {comp.logo_url && (
            <div style={{ flexShrink: 0 }}>
              <img
                src={comp.logo_url}
                alt={comp.company_name}
                style={{
                  maxHeight: '84px',
                  maxWidth: '220px',
                  objectFit: 'contain',
                  borderRadius: '4px'
                }}
              />
            </div>
          )}

          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              {comp.company_name}
            </h1>
            <p style={{ fontSize: '12px', color: '#475569', margin: '2px 0' }}>
              <strong>Address:</strong> {companyAddress}
            </p>
            {companyMobile && (
              <p style={{ fontSize: '12px', color: '#475569', margin: '2px 0' }}>
                <strong>Mobile Number:</strong> {companyMobile}
              </p>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              borderRadius: '4px',
              marginBottom: '8px'
            }}
          >
            Salary Slip
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
            {monthName} {payroll.year}
          </div>
        </div>
      </div>

      {/* 2. Employee Details (strictly: Employee Name, Employee ID, Department, Role, Salary Days) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px 16px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '18px 20px',
          marginBottom: '26px'
        }}
      >
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Employee Name
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>
            {empName}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Employee ID
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>
            {empId}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Department
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '3px' }}>
            {empDept}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Role
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '3px' }}>
            {empRole}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
            Salary Days
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>
            {salaryDays} Days
          </div>
        </div>
      </div>

      {/* 3. Salary Breakup Table (strictly: Basic Salary, HRA, Conveyance Allowance) */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '26px',
          fontSize: '12px'
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f1f5f9' }}>
            <th style={{ width: '60%', textAlign: 'left', padding: '10px 14px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
              SALARY STRUCTURE COMPONENT
            </th>
            <th style={{ width: '40%', textAlign: 'right', padding: '10px 14px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
              AMOUNT ({currencySymbol})
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px 14px', border: '1px solid #e2e8f0' }}>Basic Salary</td>
            <td style={{ padding: '10px 14px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 600 }}>
              {basicAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px 14px', border: '1px solid #e2e8f0' }}>HRA</td>
            <td style={{ padding: '10px 14px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 600 }}>
              {hraAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px 14px', border: '1px solid #e2e8f0' }}>Conveyance Allowance</td>
            <td style={{ padding: '10px 14px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 600 }}>
              {conveyanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700, borderTop: '2px solid #cbd5e1' }}>
            <td style={{ padding: '12px 14px', border: '1px solid #cbd5e1' }}>Total Gross Earnings</td>
            <td style={{ padding: '12px 14px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#1d4ed8' }}>
              {formatCurrency(grossEarnings, currencySymbol)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 4. Net Take-Home Salary Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '20px'
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Net Take-Home Salary
          </div>
          <div style={{ fontSize: '12px', color: '#15803d', marginTop: '3px', fontStyle: 'italic' }}>
            {payroll.net_salary_in_words || `${formatCurrency(netSalary, currencySymbol)} Only`}
          </div>
        </div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#166534' }}>
          {formatCurrency(netSalary, currencySymbol)}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px', color: '#94a3b8' }}>
        This is a computer-generated salary slip.
      </div>
    </div>
  );
}
