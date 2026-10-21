/**
 * @file PayslipPreviewModal.jsx
 * @description Interactive Modal for inspecting, printing, and exporting salary slips to PDF.
 */

import React, { useState } from 'react';
import { X, Printer, Download, ExternalLink, Loader2 } from 'lucide-react';
import PayslipDocument from './PayslipDocument';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getMonthName } from '../../utils/formatters';
import { payrollService } from '../../services/payrollService';

export default function PayslipPreviewModal({ isOpen, onClose, payroll, employee, company }) {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !payroll) return null;

  const emp = employee || payroll.employee || {};
  const monthName = getMonthName(payroll.month);
  const employeeName = (emp.employee_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || payroll.employee_name || 'Employee').replace(/\s+/g, '_');
  const fileName = `Salary_Slip_${employeeName}_${monthName}_${payroll.year}.pdf`;

  // Direct Browser Native Print
  const handlePrint = () => {
    window.print();
  };

  // Open dedicated server-side printable HTML page in new window
  const handleOpenPrintWindow = () => {
    if (payroll.id) {
      window.open(payrollService.getPrintHtmlUrl(payroll.id), '_blank');
    }
  };

  // Client-Side PDF Generation via html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    const element = document.getElementById('payslip-document-to-export');
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
      pdf.save(fileName);
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
        style={{ maxWidth: '940px' }}
      >
        <div className="modal-header">
          <div>
            <h3>Salary Slip Preview</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {monthName} {payroll.year}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ backgroundColor: '#f1f5f9', padding: '24px' }}>
          <PayslipDocument payroll={payroll} employee={emp} company={company} />
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleOpenPrintWindow} title="Open standalone HTML print view">
            <ExternalLink size={16} />
            Open Fullpage
          </button>
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={16} />
            Print
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDownloadPdf}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isExporting ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
