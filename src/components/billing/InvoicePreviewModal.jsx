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
  // Accurately captures the full invoice element without clipping and slices pages if multi-page
  const handleDownloadPdf = async () => {
    const element = document.getElementById('billing-document-to-export');
    if (!element) return;

    try {
      setIsExporting(true);

      // Measure full content height and width
      const targetWidth = element.offsetWidth || 800;
      const targetHeight = element.scrollHeight || element.offsetHeight;

      // Capture complete element at high DPI (scale: 2) with zero scroll clipping
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: targetWidth,
        height: targetHeight,
        windowWidth: targetWidth,
        windowHeight: targetHeight
      });

      // A4 dimensions in mm: 210 x 297 mm
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 8; // 8mm margins
      const printableWidth = pageWidth - (margin * 2); // 194mm
      const printableHeight = pageHeight - (margin * 2); // 281mm

      // Calculate conversion scale
      const mmPerPixel = printableWidth / canvas.width;
      const totalCanvasHeightMm = canvas.height * mmPerPixel;
      const pageCanvasHeight = Math.floor(printableHeight / mmPerPixel);

      if (totalCanvasHeightMm <= printableHeight + 5) {
        // Single page: fits entirely on one A4 sheet
        const finalHeightMm = Math.min(printableHeight, totalCanvasHeightMm);
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          margin,
          margin,
          printableWidth,
          finalHeightMm,
          undefined,
          'FAST'
        );
      } else {
        // Multi-page: Slice the canvas slice-by-slice so no content is lost or clipped
        let renderedPixelsY = 0;
        let pageIndex = 0;

        while (renderedPixelsY < canvas.height) {
          if (pageIndex > 0) {
            pdf.addPage();
          }

          const currentSliceHeight = Math.min(pageCanvasHeight, canvas.height - renderedPixelsY);

          // Create offscreen canvas for the slice
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = currentSliceHeight;

          const sliceCtx = sliceCanvas.getContext('2d');
          sliceCtx.fillStyle = '#ffffff';
          sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

          sliceCtx.drawImage(
            canvas,
            0,
            renderedPixelsY,
            canvas.width,
            currentSliceHeight,
            0,
            0,
            canvas.width,
            currentSliceHeight
          );

          const sliceDataUrl = sliceCanvas.toDataURL('image/png');
          const sliceHeightMm = currentSliceHeight * mmPerPixel;

          pdf.addImage(
            sliceDataUrl,
            'PNG',
            margin,
            margin,
            printableWidth,
            sliceHeightMm,
            undefined,
            'FAST'
          );

          renderedPixelsY += currentSliceHeight;
          pageIndex++;
        }
      }

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

