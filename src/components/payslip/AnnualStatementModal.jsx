/**
 * @file AnnualStatementModal.jsx
 * @description Executive 12-month Annual Salary Statement modal and print view.
 * Perfectly aligned with the official letterhead, fixed table grid, and currency format.
 */

import React, { useState, useEffect } from 'react';
import { payrollService } from '../../services/payrollService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  FileSpreadsheet,
  Printer,
  Download,
  X,
  User,
  Calendar,
  Loader2
} from 'lucide-react';

export default function AnnualStatementModal({
  isOpen,
  onClose,
  employees = [],
  preselectedEmployeeId = null,
  company = null,
  showToast
}) {
  const currentYear = new Date().getFullYear();
  const [selectedEmpId, setSelectedEmpId] = useState(preselectedEmployeeId || '');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Initialize selected employee when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (preselectedEmployeeId) {
      setSelectedEmpId(preselectedEmployeeId);
    } else if (employees && employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0].id);
    }
  }, [isOpen, preselectedEmployeeId, employees]);

  // Load statement data
  useEffect(() => {
    if (!isOpen || !selectedEmpId || !selectedYear) return;
    loadStatement();
  }, [isOpen, selectedEmpId, selectedYear]);

  const loadStatement = async () => {
    setLoading(true);
    try {
      const data = await payrollService.getAnnualStatement(selectedEmpId, selectedYear);
      setStatementData(data);
    } catch (err) {
      console.error('Annual statement load error:', err);
      if (showToast) showToast('Could not load annual statement', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const emp = statementData?.employee || employees.find(e => Number(e.id) === Number(selectedEmpId));
  const comp = statementData?.company || company || {
    company_name: 'Apex Global Technologies Ltd.',
    address: 'Tower 4, Cyber City Phase 2, Gurugram, Haryana - 122002',
    phone: '+91 124 458 9200',
    mobile_number: '+91 124 458 9200',
    logo_url: ''
  };

  const currencySymbol = comp?.currency_symbol || '₹';
  const breakdown = statementData?.monthly_breakdown || [];
  const totals = statementData?.totals || {};

  const empName = emp
    ? emp.employee_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()
    : 'Employee';
  const companyAddress = comp?.address || comp?.address_line1 || 'Company Address';
  const companyMobile = comp?.mobile_number || comp?.phone || '';

  // Client-Side PDF Generation via html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    const element = document.getElementById('annual-statement-sheet');
    if (!element) return;

    try {
      setIsExporting(true);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 8, pdfWidth, pdfHeight);
      const safeName = empName.replace(/\s+/g, '_');
      pdf.save(`Annual_Salary_Statement_${safeName}_${selectedYear}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Unable to generate PDF automatically. You can use the Print button to Save as PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box large"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '960px',
          width: '96%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                Annual Salary Statement
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                12-Month Earnings Summary for {selectedYear}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={15} />
              Print
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {isExporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              Download PDF
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr auto',
            gap: '12px',
            alignItems: 'flex-end',
            padding: '12px 24px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            flexShrink: 0
          }}
        >
          {/* Select Employee */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={12} color="var(--color-primary)" />
              Select Employee
            </label>
            <select
              className="form-select form-select-sm"
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              style={{ height: '36px', fontSize: '13px' }}
            >
              {employees.map(e => {
                const name = e.employee_name || `${e.first_name || ''} ${e.last_name || ''}`.trim();
                return (
                  <option key={e.id} value={e.id}>
                    {name} ({e.employee_code}) - {e.department || 'General'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Select Year */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} color="var(--color-primary)" />
              Financial / Calendar Year
            </label>
            <select
              className="form-select form-select-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{ height: '36px', fontSize: '13px' }}
            >
              {['2024', '2025', '2026', '2027', '2028'].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={loadStatement}
              style={{ height: '36px' }}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body / Printable Sheet */}
        <div
          className="modal-body"
          style={{
            backgroundColor: '#f1f5f9',
            padding: '28px 24px',
            overflowY: 'auto',
            flex: 1
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <Loader2 size={32} className="animate-spin" color="var(--color-primary)" style={{ margin: '0 auto 12px' }} />
              <div>Generating Annual Salary Statement...</div>
            </div>
          ) : (
            <div
              className="payslip-print-target"
              id="annual-statement-sheet"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '36px',
                maxWidth: '860px',
                margin: '0 auto',
                color: '#0f172a',
                fontFamily: "'Inter', sans-serif",
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}
            >
              {/* 1. Statement Letterhead */}
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
                {/* Left: Company Details & Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  {comp?.logo_url && (
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
                      {comp?.company_name}
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

                {/* Right: Statement Meta */}
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
                    Annual Statement
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                    Calendar Year {selectedYear}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                    Generated: {formatDate(new Date())}
                  </div>
                </div>
              </div>

              {/* 2. Employee Details Banner */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px 16px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  marginBottom: '24px'
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
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '3px', fontFamily: 'monospace' }}>
                    {emp?.employee_code || '-'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Department & Role
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '3px' }}>
                    {emp?.department || 'General'} • {emp?.role || emp?.designation || 'Staff'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Date of Joining
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '3px' }}>
                    {emp?.date_of_joining ? formatDate(emp.date_of_joining) : 'N/A'}
                  </div>
                </div>
              </div>

              {/* 3. 12-Month Detailed Table (Fixed Layout with Strict Column Widths) */}
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  tableLayout: 'fixed',
                  marginBottom: '22px',
                  fontSize: '11px',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                    <th style={{ width: '13%', textAlign: 'left', padding: '10px 10px', border: '1px solid #1e293b', fontWeight: 700, color: '#ffffff' }}>
                      MONTH
                    </th>
                    <th style={{ width: '16%', textAlign: 'left', padding: '10px 10px', border: '1px solid #1e293b', fontWeight: 700, color: '#ffffff' }}>
                      SLIP NO.
                    </th>
                    <th style={{ width: '9%', textAlign: 'center', padding: '10px 6px', border: '1px solid #1e293b', fontWeight: 700, color: '#ffffff' }}>
                      DAYS
                    </th>
                    <th style={{ width: '15%', textAlign: 'right', padding: '10px 10px', border: '1px solid #1e293b', fontWeight: 700, color: '#ffffff' }}>
                      BASIC ({currencySymbol})
                    </th>
                    <th style={{ width: '14%', textAlign: 'right', padding: '10px 10px', border: '1px solid #1e293b', fontWeight: 700, color: '#ffffff' }}>
                      HRA ({currencySymbol})
                    </th>
                    <th style={{ width: '15%', textAlign: 'right', padding: '10px 10px', border: '1px solid #1e293b', fontWeight: 700, color: '#ffffff' }}>
                      CONVEYANCE ({currencySymbol})
                    </th>
                    <th style={{ width: '18%', textAlign: 'right', padding: '10px 10px', border: '1px solid #1e293b', fontWeight: 700, color: '#ffffff' }}>
                      NET SALARY ({currencySymbol})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((row, idx) => {
                    const isIssued = row.is_issued;
                    const rowBg = isIssued ? (idx % 2 === 0 ? '#ffffff' : '#f8fafc') : '#fafafa';
                    return (
                      <tr
                        key={row.month}
                        style={{
                          backgroundColor: rowBg,
                          opacity: isIssued ? 1 : 0.65
                        }}
                      >
                        <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontWeight: isIssued ? 700 : 500, color: isIssued ? '#0f172a' : '#64748b' }}>
                          {row.month_name}
                        </td>
                        <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '11px', color: isIssued ? 'var(--color-primary)' : '#94a3b8' }}>
                          {isIssued ? row.slip_number : '-'}
                        </td>
                        <td style={{ padding: '8px 6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: isIssued ? 600 : 400 }}>
                          {isIssued ? `${row.salary_days}` : '-'}
                        </td>
                        <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          {isIssued ? row.basic_pay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                        </td>
                        <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          {isIssued ? row.hra_pay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                        </td>
                        <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          {isIssued ? row.conveyance_pay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                        </td>
                        <td
                          style={{
                            padding: '8px 10px',
                            border: '1px solid #cbd5e1',
                            textAlign: 'right',
                            fontWeight: isIssued ? 700 : 400,
                            color: isIssued ? '#059669' : '#94a3b8',
                            fontVariantNumeric: 'tabular-nums'
                          }}
                        >
                          {isIssued ? row.net_salary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                        </td>
                      </tr>
                    );
                  })}

                  {/* TOTALS ROW - Exactly Matching the 7 Columns */}
                  <tr style={{ backgroundColor: '#f1f5f9', borderTop: '2px solid #0f172a', fontWeight: 800 }}>
                    <td style={{ padding: '10px 10px', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '12px' }}>
                      ANNUAL TOTAL
                    </td>
                    <td style={{ padding: '10px 10px', border: '1px solid #cbd5e1', color: '#475569', fontSize: '11px' }}>
                      {totals.issued_months_count} Months Issued
                    </td>
                    <td style={{ padding: '10px 6px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#0f172a', fontSize: '12px' }}>
                      {totals.total_salary_days || 0}
                    </td>
                    <td style={{ padding: '10px 10px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a', fontSize: '12px', fontVariantNumeric: 'tabular-nums' }}>
                      {(totals.total_basic_pay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 10px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a', fontSize: '12px', fontVariantNumeric: 'tabular-nums' }}>
                      {(totals.total_hra_pay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 10px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a', fontSize: '12px', fontVariantNumeric: 'tabular-nums' }}>
                      {(totals.total_conveyance_pay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td
                      style={{
                        padding: '10px 10px',
                        border: '1px solid #cbd5e1',
                        textAlign: 'right',
                        color: '#059669',
                        fontSize: '13px',
                        fontWeight: 800,
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {(totals.total_net_salary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Annual Net Disbursed
                  </div>
                  <div style={{ fontSize: '12px', color: '#15803d', marginTop: '3px', fontStyle: 'italic' }}>
                    {totals.total_net_in_words || 'Zero Rupees Only'}
                  </div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#166534' }}>
                  {formatCurrency(totals.total_net_salary || 0, currencySymbol)}
                </div>
              </div>

              {/* 5. Summary Highlights Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginTop: '16px'
                }}
              >
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Months Processed</span>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                    {totals.issued_months_count} of 12 Months
                  </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Average Monthly Net</span>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    {formatCurrency(totals.average_monthly_net || 0, currencySymbol)}
                  </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total Days Worked</span>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    {totals.total_salary_days || 0} Days
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '10px', color: '#94a3b8' }}>
                This is a computer-generated Annual Salary Statement • WorkPulse System
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer: Fixed Pinned Action Buttons */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handlePrint}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={16} />
            Print
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
