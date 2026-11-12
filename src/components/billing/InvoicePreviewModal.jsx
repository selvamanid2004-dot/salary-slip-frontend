/**
 * @file InvoicePreviewModal.jsx
 * @description Modal dialog for inspecting, printing, and exporting IT Quotations and Invoices to PDF.
 */

import React, { useState } from 'react';
import { X, Printer, Download, ExternalLink, Loader2, ArrowRightLeft } from 'lucide-react';
import InvoiceDocument from './InvoiceDocument';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { invoiceService } from '../../services/invoiceService';

export default function InvoicePreviewModal({
  isOpen,
  onClose,
  invoice,
  company,
  onConvertToInvoice
}) {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !invoice) return null;

  const isQuotation = invoice.doc_type === 'quotation';
  const fileName = `${isQuotation ? 'Quotation' : 'Invoice'}_${invoice.doc_number}_${(invoice.client_name || 'Client').replace(/\s+/g, '_')}.pdf`;

  // Native browser print
  const handlePrint = () => {
    window.print();
  };

  // Open dedicated server-side printable HTML page in new window
  const handleOpenPrintWindow = () => {
    if (invoice.id) {
      window.open(invoiceService.getPrintUrl(invoice.id), '_blank');
    }
  };

  // Client-Side PDF Generation via html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    const element = document.getElementById('billing-document-to-export');
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

      // Add image centered/padded
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
        style={{ maxWidth: '940px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="modal-header" style={{ padding: '16px 24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>
                {isQuotation ? 'Quotation Preview' : 'Invoice Preview'}
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: invoice.bill_type === 'gst' ? '#eff6ff' : '#ecfdf5',
                  color: invoice.bill_type === 'gst' ? '#1d4ed8' : '#065f46',
                  border: `1px solid ${invoice.bill_type === 'gst' ? '#bfdbfe' : '#a7f3d0'}`
                }}
              >
                {invoice.bill_type === 'gst' ? 'GST Bill' : 'Non-GST Bill'}
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {invoice.doc_number} • {invoice.client_company || invoice.client_name}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isQuotation && onConvertToInvoice && invoice.status !== 'accepted' && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onConvertToInvoice(invoice)}
                title="Convert this quotation into an official invoice"
              >
                <ArrowRightLeft size={14} />
                Convert to Invoice
              </button>
            )}

            <button
              className="btn btn-outline btn-sm"
              onClick={handleOpenPrintWindow}
              title="Open full page view"
            >
              <ExternalLink size={14} />
              Open Print Window
            </button>

            <button
              className="btn btn-outline btn-sm"
              onClick={handlePrint}
              title="Print document directly"
            >
              <Printer size={14} />
              Print
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={handleDownloadPdf}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 size={14} className="spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download size={14} />
                  Download PDF
                </>
              )}
            </button>

            <button className="icon-btn" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div
          className="modal-body"
          style={{
            padding: '24px',
            backgroundColor: '#f1f5f9',
            overflowY: 'auto',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <InvoiceDocument
            id="billing-document-to-export"
            invoice={invoice}
            company={company}
          />
        </div>
      </div>
    </div>
  );
}

