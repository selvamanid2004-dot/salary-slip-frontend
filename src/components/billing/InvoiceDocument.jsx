/**
 * @file InvoiceDocument.jsx
 * @description Clean, professional, and print-ready presentation component for IT Service
 * Quotations and Invoices (GST & Non-GST).
 */

import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function InvoiceDocument({ invoice, company, id = 'invoice-document-to-export' }) {
  if (!invoice) return null;

  const isQuotation = invoice.doc_type === 'quotation';
  const isGst = invoice.bill_type === 'gst';

  const docTitle = isQuotation
    ? (isGst ? 'SERVICE QUOTATION' : 'QUOTATION (NON-GST)')
    : (isGst ? 'TAX INVOICE' : 'INVOICE / BILL (NON-GST)');

  const docNumberLabel = isQuotation ? 'Quotation No:' : 'Invoice No:';
  const dateLabel = isQuotation ? 'Date:' : 'Invoice Date:';
  const dueDateLabel = isQuotation ? 'Valid Until:' : 'Due Date:';

  const currencySymbol = invoice.currency_symbol || company?.currency_symbol || '₹';

  // Parse items safely
  let items = [];
  if (Array.isArray(invoice.items)) {
    items = invoice.items;
  } else if (typeof invoice.items === 'string') {
    try {
      items = JSON.parse(invoice.items);
    } catch {
      items = [];
    }
  }

  // Company details
  const compName = invoice.company_name || company?.company_name || 'IT Solutions & Services';
  const compTagline = company?.tagline || '';
  const compAddress = invoice.company_address || company?.address || [
    company?.address_line1,
    company?.address_line2,
    company?.city,
    company?.state,
    company?.postal_code
  ].filter(Boolean).join(', ');
  const compPhone = invoice.company_phone || company?.phone || company?.mobile_number || '';
  const compEmail = invoice.company_email || company?.email || '';
  const compGstin = invoice.company_gstin || company?.gst_number || '';
  const compPan = invoice.company_pan || company?.pan_number || '';
  const compLogo = invoice.company_logo || company?.logo_url || '';

  // Bank details
  const bankName = invoice.bank_name || company?.bank_name || '';
  const bankAccount = invoice.bank_account_no || company?.bank_account_no || '';
  const bankIfsc = invoice.bank_ifsc || company?.bank_ifsc_code || '';
  const bankBranch = invoice.bank_branch || company?.bank_branch || '';
  const bankHolder = invoice.bank_account_holder || company?.bank_account_holder || compName;
  const bankUpi = invoice.bank_upi_id || company?.bank_upi_id || '';

  const hasBankDetails = Boolean(bankName || bankAccount || bankIfsc || bankUpi);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      id={id}
      style={{
        width: '100%',
        maxWidth: '820px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        color: '#1e293b',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '32px 36px',
        boxSizing: 'border-box',
        lineHeight: 1.5,
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}
    >
      {/* 1. Header: Company Info on left, Doc Title & Meta on right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ maxWidth: '55%' }}>
          {compLogo && (
            <img
              src={compLogo}
              alt="Company Logo"
              style={{ maxHeight: '68px', maxWidth: '200px', objectFit: 'contain', marginBottom: '10px', display: 'block' }}
            />
          )}
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {compName}
          </div>
          {compTagline && (
            <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500, marginTop: '1px' }}>
              {compTagline}
            </div>
          )}
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px', lineHeight: 1.45 }}>
            {compAddress && <div>{compAddress}</div>}
            {compPhone && <div><strong>Phone:</strong> {compPhone}</div>}
            {compEmail && <div><strong>Email:</strong> {compEmail}</div>}
            {isGst && compGstin && <div><strong>GSTIN:</strong> {compGstin}</div>}
            {compPan && <div><strong>PAN:</strong> {compPan}</div>}
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: '220px' }}>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: isGst ? '#1e40af' : '#047857',
              textTransform: 'uppercase'
            }}
          >
            {docTitle}
          </div>
          <div style={{ marginTop: '4px' }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: isGst ? '#eff6ff' : '#ecfdf5',
                color: isGst ? '#1d4ed8' : '#065f46',
                border: `1px solid ${isGst ? '#bfdbfe' : '#a7f3d0'}`,
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}
            >
              {isGst ? 'GST Compliant' : 'Non-GST Bill'}
            </span>
          </div>

          <table style={{ marginTop: '12px', marginLeft: 'auto', borderCollapse: 'collapse', fontSize: '12px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '2px 6px', color: '#64748b', fontWeight: 600, textAlign: 'right' }}>
                  {docNumberLabel}
                </td>
                <td style={{ padding: '2px 6px', color: '#0f172a', fontWeight: 700, textAlign: 'right' }}>
                  {invoice.doc_number}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '2px 6px', color: '#64748b', fontWeight: 600, textAlign: 'right' }}>
                  {dateLabel}
                </td>
                <td style={{ padding: '2px 6px', color: '#0f172a', fontWeight: 700, textAlign: 'right' }}>
                  {formatDate(invoice.issue_date)}
                </td>
              </tr>
              {invoice.due_date && (
                <tr>
                  <td style={{ padding: '2px 6px', color: '#64748b', fontWeight: 600, textAlign: 'right' }}>
                    {dueDateLabel}
                  </td>
                  <td style={{ padding: '2px 6px', color: '#0f172a', fontWeight: 700, textAlign: 'right' }}>
                    {formatDate(invoice.due_date)}
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ padding: '2px 6px', color: '#64748b', fontWeight: 600, textAlign: 'right' }}>
                  Status:
                </td>
                <td style={{ padding: '2px 6px', color: '#0f172a', fontWeight: 700, textAlign: 'right', textTransform: 'capitalize' }}>
                  {invoice.status || 'Draft'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Thin Divider */}
      <div style={{ height: '2px', backgroundColor: '#e2e8f0', margin: '14px 0 20px 0' }} />

      {/* 2. Customer & Service Scope Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '14px 16px'
          }}
        >
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: '6px'
            }}
          >
            Bill To / Client Details
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
            {invoice.client_name}
          </div>
          {invoice.client_company && (
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginTop: '2px' }}>
              {invoice.client_company}
            </div>
          )}
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px', lineHeight: 1.45 }}>
            {invoice.client_address && <div>{invoice.client_address}</div>}
            {(invoice.client_city || invoice.client_state || invoice.client_pincode) && (
              <div>
                {[invoice.client_city, invoice.client_state, invoice.client_pincode].filter(Boolean).join(', ')}
              </div>
            )}
            {invoice.client_phone && <div><strong>Phone:</strong> {invoice.client_phone}</div>}
            {invoice.client_email && <div><strong>Email:</strong> {invoice.client_email}</div>}
            {isGst && invoice.client_gstin && <div><strong>Client GSTIN:</strong> {invoice.client_gstin}</div>}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '14px 16px'
          }}
        >
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: '6px'
            }}
          >
            IT Billing Overview
          </div>
          <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.55 }}>
            <div><strong>Billing Type:</strong> {isGst ? 'GST Tax Invoice' : 'Non-GST Service Bill'}</div>
            <div><strong>Currency:</strong> {currencySymbol} INR</div>
            {isGst && <div><strong>IT SAC Code:</strong> 9983 (Software & IT Services)</div>}
            {invoice.notes && (
              <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
                "{invoice.notes}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. IT Services Line Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '22px' }}>
        <thead>
          <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
            <th style={{ width: '5%', padding: '9px 12px', fontSize: '11.5px', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}>#</th>
            <th style={{ width: '50%', padding: '9px 12px', fontSize: '11.5px', fontWeight: 700, textAlign: 'left', textTransform: 'uppercase' }}>Service Description</th>
            {isGst && (
              <th style={{ width: '12%', padding: '9px 12px', fontSize: '11.5px', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}>SAC Code</th>
            )}
            <th style={{ width: '10%', padding: '9px 12px', fontSize: '11.5px', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}>Qty</th>
            <th style={{ width: '13%', padding: '9px 12px', fontSize: '11.5px', fontWeight: 700, textAlign: 'right', textTransform: 'uppercase' }}>Service Charge</th>
            <th style={{ width: '15%', padding: '9px 12px', fontSize: '11.5px', fontWeight: 700, textAlign: 'right', textTransform: 'uppercase' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.id || idx}
              style={{
                backgroundColor: idx % 2 === 1 ? '#fafbfd' : '#ffffff',
                borderBottom: '1px solid #e2e8f0'
              }}
            >
              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                {idx + 1}
              </td>
              <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                  {item.service_title}
                </div>
                {item.description && (
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px', whiteSpace: 'pre-line' }}>
                    {item.description}
                  </div>
                )}
              </td>
              {isGst && (
                <td style={{ padding: '10px 12px', textAlign: 'center', verticalAlign: 'top' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '10.5px',
                      fontWeight: 600,
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      padding: '1px 5px',
                      borderRadius: '3px'
                    }}
                  >
                    {item.sac_code || '998314'}
                  </span>
                </td>
              )}
              <td style={{ padding: '10px 12px', textAlign: 'center', verticalAlign: 'top', fontSize: '12.5px' }}>
                {item.qty || 1}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'right', verticalAlign: 'top', fontSize: '12.5px' }}>
                {currencySymbol}{formatCurrency(item.rate || 0)}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'right', verticalAlign: 'top', fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                {currencySymbol}{formatCurrency(item.amount || 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 4. Bottom Section: Bank Details & Total in Words on Left, Calculations on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '22px', alignItems: 'flex-start' }}>
        <div>
          {/* Amount in words */}
          <div
            style={{
              backgroundColor: '#f1f5f9',
              borderLeft: '4px solid #3b82f6',
              padding: '10px 14px',
              borderRadius: '0 6px 6px 0',
              marginBottom: '14px'
            }}
          >
            <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
              Grand Total in Words
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {invoice.grand_total_in_words || 'Zero Rupees Only'}
            </div>
          </div>

          {/* Company Bank Account Details Card */}
          {hasBankDetails && (
            <div
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '12px 14px',
                backgroundColor: '#f8fafc'
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#1e40af',
                  marginBottom: '8px'
                }}
              >
                Company Bank Account Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: '4px', fontSize: '11.5px' }}>
                {bankName && (
                  <>
                    <div style={{ color: '#64748b', fontWeight: 600 }}>Bank Name:</div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>{bankName}</div>
                  </>
                )}
                {bankHolder && (
                  <>
                    <div style={{ color: '#64748b', fontWeight: 600 }}>Account Name:</div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>{bankHolder}</div>
                  </>
                )}
                {bankAccount && (
                  <>
                    <div style={{ color: '#64748b', fontWeight: 600 }}>Account No:</div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>{bankAccount}</div>
                  </>
                )}
                {bankIfsc && (
                  <>
                    <div style={{ color: '#64748b', fontWeight: 600 }}>IFSC Code:</div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>{bankIfsc}</div>
                  </>
                )}
                {bankBranch && (
                  <>
                    <div style={{ color: '#64748b', fontWeight: 600 }}>Branch:</div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>{bankBranch}</div>
                  </>
                )}
                {bankUpi && (
                  <>
                    <div style={{ color: '#64748b', fontWeight: 600 }}>UPI ID:</div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>{bankUpi}</div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Financials Calculation Table */}
        <div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <tbody>
              <tr>
                <td style={{ padding: '8px 14px', fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Subtotal:</td>
                <td style={{ padding: '8px 14px', fontSize: '12.5px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                  {currencySymbol}{formatCurrency(invoice.subtotal || 0)}
                </td>
              </tr>

              {parseFloat(invoice.discount_amount) > 0 && (
                <>
                  <tr>
                    <td style={{ padding: '6px 14px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                      Discount {invoice.discount_rate > 0 ? `(${invoice.discount_rate}%)` : ''}:
                    </td>
                    <td style={{ padding: '6px 14px', fontSize: '12px', textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>
                      -{currencySymbol}{formatCurrency(invoice.discount_amount)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 14px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Taxable Amount:</td>
                    <td style={{ padding: '6px 14px', fontSize: '12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {currencySymbol}{formatCurrency((invoice.subtotal || 0) - (invoice.discount_amount || 0))}
                    </td>
                  </tr>
                </>
              )}

              {isGst ? (
                <>
                  {invoice.tax_type === 'igst' ? (
                    <tr>
                      <td style={{ padding: '6px 14px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                        IGST ({invoice.gst_rate || 18}%):
                      </td>
                      <td style={{ padding: '6px 14px', fontSize: '12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        {currencySymbol}{formatCurrency(invoice.igst_amount || invoice.total_tax || 0)}
                      </td>
                    </tr>
                  ) : (
                    <>
                      <tr>
                        <td style={{ padding: '5px 14px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                          CGST ({(invoice.gst_rate || 18) / 2}%):
                        </td>
                        <td style={{ padding: '5px 14px', fontSize: '12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          {currencySymbol}{formatCurrency(invoice.cgst_amount || 0)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 14px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                          SGST ({(invoice.gst_rate || 18) / 2}%):
                        </td>
                        <td style={{ padding: '5px 14px', fontSize: '12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          {currencySymbol}{formatCurrency(invoice.sgst_amount || 0)}
                        </td>
                      </tr>
                    </>
                  )}
                  <tr>
                    <td style={{ padding: '7px 14px', fontSize: '12.5px', color: '#64748b', fontWeight: 600, borderTop: '1px solid #e2e8f0' }}>
                      Total GST:
                    </td>
                    <td style={{ padding: '7px 14px', fontSize: '12.5px', textAlign: 'right', fontWeight: 700, color: '#0f172a', borderTop: '1px solid #e2e8f0' }}>
                      {currencySymbol}{formatCurrency(invoice.total_tax || 0)}
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={2} style={{ padding: '8px 14px', fontSize: '11px', color: '#059669', backgroundColor: '#ecfdf5', textAlign: 'center', fontWeight: 600 }}>
                    ✓ Non-GST Bill (Zero Tax Applied)
                  </td>
                </tr>
              )}

              <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                <td style={{ padding: '10px 14px', fontSize: '14px', fontWeight: 800 }}>
                  Grand Total:
                </td>
                <td style={{ padding: '10px 14px', fontSize: '16px', fontWeight: 800, textAlign: 'right', color: '#ffffff' }}>
                  {currencySymbol}{formatCurrency(invoice.grand_total || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Terms & Conditions and Authorized Signatory */}
      <div
        style={{
          marginTop: '28px',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end'
        }}
      >
        <div style={{ maxWidth: '60%', fontSize: '11px', color: '#64748b', lineHeight: 1.45 }}>
          <div style={{ fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '3px' }}>
            Terms &amp; Conditions:
          </div>
          <div style={{ whiteSpace: 'pre-line' }}>
            {invoice.terms ||
              '1. Payments should be remitted to the company bank account details listed above.\n2. Please cite the invoice/quotation number in the payment advice.\n3. This is a computer generated document.'}
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: '180px' }}>
          <div style={{ width: '160px', borderTop: '1px solid #94a3b8', marginLeft: 'auto', marginBottom: '6px' }} />
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>
            For {compName}
          </div>
          <div style={{ fontSize: '10.5px', color: '#64748b' }}>
            Authorized Signatory
          </div>
        </div>
      </div>
    </div>
  );
}

