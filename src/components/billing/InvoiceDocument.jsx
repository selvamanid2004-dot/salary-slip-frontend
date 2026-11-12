/**
 * @file InvoiceDocument.jsx
 * @description Clean, professional presentation and print component for IT Service
 * Quotations and Invoices (GST & Non-GST).
 * Formatted with Times New Roman, increased logo size, table-based layout for perfect
 * PDF rendering, single currency symbols, and without Terms and Conditions.
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
  const compName = invoice.company_name || company?.company_name || 'Apex Global Technologies Ltd.';
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

  // Filter unwanted sentence from notes if present
  const cleanedNotes = (invoice.notes || '')
    .replace(/Thank you for your business\.\s*Net payable within 15 days\./gi, '')
    .trim();

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

  const fontStyle = { fontFamily: '"Times New Roman", Times, serif' };

  return (
    <div
      id={id}
      style={{
        width: '800px',
        minWidth: '800px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        color: '#111827',
        ...fontStyle,
        padding: '36px 40px',
        boxSizing: 'border-box',
        lineHeight: 1.45,
        borderRadius: '6px',
        border: '1px solid #d1d5db'
      }}
    >
      {/* 1. Header: Company Info on left, Doc Title & Meta on right */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', ...fontStyle }}>
        <tbody>
          <tr>
            <td style={{ width: '56%', verticalAlign: 'top', paddingRight: '16px' }}>
              {compLogo && (
                <div style={{ marginBottom: '12px' }}>
                  <img
                    src={compLogo}
                    alt="Company Logo"
                    style={{
                      maxHeight: '120px',
                      maxWidth: '280px',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                </div>
              )}
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#111827', letterSpacing: '0.01em', lineHeight: 1.2 }}>
                {compName}
              </div>
              {compTagline && (
                <div style={{ fontSize: '13px', color: '#4b5563', fontStyle: 'italic', marginTop: '2px' }}>
                  {compTagline}
                </div>
              )}
              <div style={{ fontSize: '13px', color: '#374151', marginTop: '6px', lineHeight: 1.45 }}>
                {compAddress && <div>{compAddress}</div>}
                {compPhone && <div><strong>Phone:</strong> {compPhone}</div>}
                {compEmail && <div><strong>Email:</strong> {compEmail}</div>}
                {isGst && compGstin && <div><strong>GSTIN:</strong> {compGstin}</div>}
                {compPan && <div><strong>PAN:</strong> {compPan}</div>}
              </div>
            </td>

            <td style={{ width: '44%', verticalAlign: 'top', textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: isGst ? '#1e3a8a' : '#065f46',
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
                    color: isGst ? '#1e40af' : '#047857',
                    border: `1px solid ${isGst ? '#bfdbfe' : '#a7f3d0'}`,
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  {isGst ? 'GST Compliant' : 'Non-GST Bill'}
                </span>
              </div>

              <table style={{ marginTop: '12px', marginLeft: 'auto', borderCollapse: 'collapse', fontSize: '13px', ...fontStyle }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '2px 6px', color: '#4b5563', fontWeight: 600, textAlign: 'right' }}>
                      {docNumberLabel}
                    </td>
                    <td style={{ padding: '2px 6px', color: '#111827', fontWeight: 700, textAlign: 'right' }}>
                      {invoice.doc_number}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 6px', color: '#4b5563', fontWeight: 600, textAlign: 'right' }}>
                      {dateLabel}
                    </td>
                    <td style={{ padding: '2px 6px', color: '#111827', fontWeight: 700, textAlign: 'right' }}>
                      {formatDate(invoice.issue_date)}
                    </td>
                  </tr>
                  {invoice.due_date && (
                    <tr>
                      <td style={{ padding: '2px 6px', color: '#4b5563', fontWeight: 600, textAlign: 'right' }}>
                        {dueDateLabel}
                      </td>
                      <td style={{ padding: '2px 6px', color: '#111827', fontWeight: 700, textAlign: 'right' }}>
                        {formatDate(invoice.due_date)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '2px 6px', color: '#4b5563', fontWeight: 600, textAlign: 'right' }}>
                      Status:
                    </td>
                    <td style={{ padding: '2px 6px', color: '#111827', fontWeight: 700, textAlign: 'right', textTransform: 'capitalize' }}>
                      {invoice.status || 'Draft'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Horizontal Divider */}
      <div style={{ height: '2px', backgroundColor: '#e5e7eb', margin: '14px 0 18px 0' }} />

      {/* 2. Customer & IT Service Scope Information (Table-based for 100% reliable PDF rendering) */}
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '14px 0', marginBottom: '20px', marginLeft: '-14px', marginRight: '-14px', ...fontStyle }}>
        <tbody>
          <tr>
            <td
              style={{
                width: '58%',
                verticalAlign: 'top',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '14px 16px'
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#4b5563',
                  marginBottom: '6px'
                }}
              >
                Bill To / Client Details
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                {invoice.client_name}
              </div>
              {invoice.client_company && (
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#374151', marginTop: '2px' }}>
                  {invoice.client_company}
                </div>
              )}
              <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '5px', lineHeight: 1.45 }}>
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
            </td>

            <td
              style={{
                width: '42%',
                verticalAlign: 'top',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '14px 16px'
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#4b5563',
                  marginBottom: '6px'
                }}
              >
                IT Services Billing
              </div>
              <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.55 }}>
                <div><strong>Billing Type:</strong> {isGst ? 'GST Tax Invoice' : 'Non-GST Service Bill'}</div>
                <div><strong>Currency:</strong> {currencySymbol} INR</div>
                {isGst && <div><strong>SAC Code:</strong> 9983 (IT Services)</div>}
                {cleanedNotes && (
                  <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#4b5563', borderTop: '1px dashed #d1d5db', paddingTop: '6px' }}>
                    "{cleanedNotes}"
                  </div>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 3. IT Services Line Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', ...fontStyle }}>
        <thead>
          <tr style={{ backgroundColor: '#111827', color: '#ffffff' }}>
            <th style={{ width: '6%', padding: '9px 10px', fontSize: '12px', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}>#</th>
            <th style={{ width: isGst ? '48%' : '58%', padding: '9px 12px', fontSize: '12px', fontWeight: 700, textAlign: 'left', textTransform: 'uppercase' }}>Service Description</th>
            {isGst && (
              <th style={{ width: '12%', padding: '9px 10px', fontSize: '12px', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}>SAC Code</th>
            )}
            <th style={{ width: '10%', padding: '9px 10px', fontSize: '12px', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}>Qty</th>
            <th style={{ width: '12%', padding: '9px 12px', fontSize: '12px', fontWeight: 700, textAlign: 'right', textTransform: 'uppercase' }}>Service Charge</th>
            <th style={{ width: '14%', padding: '9px 12px', fontSize: '12px', fontWeight: 700, textAlign: 'right', textTransform: 'uppercase' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.id || idx}
              style={{
                backgroundColor: idx % 2 === 1 ? '#f9fafb' : '#ffffff',
                borderBottom: '1px solid #e5e7eb'
              }}
            >
              <td style={{ padding: '10px 8px', textAlign: 'center', color: '#4b5563', fontSize: '13px' }}>
                {idx + 1}
              </td>
              <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: '13.5px' }}>
                  {item.service_title}
                </div>
                {item.description && (
                  <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '3px', whiteSpace: 'pre-line' }}>
                    {item.description}
                  </div>
                )}
              </td>
              {isGst && (
                <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'top' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      padding: '1px 6px',
                      borderRadius: '3px'
                    }}
                  >
                    {item.sac_code || '998314'}
                  </span>
                </td>
              )}
              <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'top', fontSize: '13px' }}>
                {item.qty || 1}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'right', verticalAlign: 'top', fontSize: '13px' }}>
                {formatCurrency(item.rate || 0, currencySymbol)}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'right', verticalAlign: 'top', fontWeight: 700, color: '#111827', fontSize: '13.5px' }}>
                {formatCurrency(item.amount || 0, currencySymbol)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 4. Bottom Section: Bank Details & Total in Words on Left, Calculations on Right */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', ...fontStyle }}>
        <tbody>
          <tr>
            {/* Left Column: Words & Bank Account Details */}
            <td style={{ width: '56%', verticalAlign: 'top', paddingRight: '16px' }}>
              {/* Grand Total in Words */}
              <div
                style={{
                  backgroundColor: '#f3f4f6',
                  borderLeft: '4px solid #1e3a8a',
                  padding: '10px 14px',
                  borderRadius: '0 4px 4px 0',
                  marginBottom: '14px'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4b5563' }}>
                  Grand Total in Words
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827', marginTop: '3px' }}>
                  {invoice.grand_total_in_words || 'Zero Rupees Only'}
                </div>
              </div>

              {/* Company Bank Account Details Card */}
              {hasBankDetails && (
                <div
                  style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '12px 14px',
                    backgroundColor: '#f9fafb'
                  }}
                >
                  <div
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#1e3a8a',
                      marginBottom: '8px'
                    }}
                  >
                    Company Bank Account Details
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', ...fontStyle }}>
                    <tbody>
                      {bankName && (
                        <tr>
                          <td style={{ width: '110px', padding: '2px 0', color: '#4b5563', fontWeight: 600 }}>Bank Name:</td>
                          <td style={{ padding: '2px 0', color: '#111827', fontWeight: 700 }}>{bankName}</td>
                        </tr>
                      )}
                      {bankHolder && (
                        <tr>
                          <td style={{ width: '110px', padding: '2px 0', color: '#4b5563', fontWeight: 600 }}>Account Name:</td>
                          <td style={{ padding: '2px 0', color: '#111827', fontWeight: 700 }}>{bankHolder}</td>
                        </tr>
                      )}
                      {bankAccount && (
                        <tr>
                          <td style={{ width: '110px', padding: '2px 0', color: '#4b5563', fontWeight: 600 }}>Account No:</td>
                          <td style={{ padding: '2px 0', color: '#111827', fontWeight: 700 }}>{bankAccount}</td>
                        </tr>
                      )}
                      {bankIfsc && (
                        <tr>
                          <td style={{ width: '110px', padding: '2px 0', color: '#4b5563', fontWeight: 600 }}>IFSC Code:</td>
                          <td style={{ padding: '2px 0', color: '#111827', fontWeight: 700 }}>{bankIfsc}</td>
                        </tr>
                      )}
                      {bankBranch && (
                        <tr>
                          <td style={{ width: '110px', padding: '2px 0', color: '#4b5563', fontWeight: 600 }}>Branch:</td>
                          <td style={{ padding: '2px 0', color: '#111827', fontWeight: 700 }}>{bankBranch}</td>
                        </tr>
                      )}
                      {bankUpi && (
                        <tr>
                          <td style={{ width: '110px', padding: '2px 0', color: '#4b5563', fontWeight: 600 }}>UPI ID:</td>
                          <td style={{ padding: '2px 0', color: '#111827', fontWeight: 700 }}>{bankUpi}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </td>

            {/* Right Column: Financials Calculation Table */}
            <td style={{ width: '44%', verticalAlign: 'top' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  ...fontStyle
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 14px', fontSize: '13px', color: '#4b5563', fontWeight: 600 }}>Subtotal:</td>
                    <td style={{ padding: '8px 14px', fontSize: '13px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                      {formatCurrency(invoice.subtotal || 0, currencySymbol)}
                    </td>
                  </tr>

                  {parseFloat(invoice.discount_amount) > 0 && (
                    <>
                      <tr>
                        <td style={{ padding: '6px 14px', fontSize: '12.5px', color: '#4b5563', fontWeight: 600 }}>
                          Discount {invoice.discount_rate > 0 ? `(${invoice.discount_rate}%)` : ''}:
                        </td>
                        <td style={{ padding: '6px 14px', fontSize: '12.5px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                          -{formatCurrency(invoice.discount_amount, currencySymbol)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 14px', fontSize: '12.5px', color: '#4b5563', fontWeight: 600 }}>Taxable Amount:</td>
                        <td style={{ padding: '6px 14px', fontSize: '12.5px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                          {formatCurrency((invoice.subtotal || 0) - (invoice.discount_amount || 0), currencySymbol)}
                        </td>
                      </tr>
                    </>
                  )}

                  {isGst ? (
                    <>
                      {invoice.tax_type === 'igst' ? (
                        <tr>
                          <td style={{ padding: '6px 14px', fontSize: '12.5px', color: '#4b5563', fontWeight: 600 }}>
                            IGST ({invoice.gst_rate || 18}%):
                          </td>
                          <td style={{ padding: '6px 14px', fontSize: '12.5px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                            {formatCurrency(invoice.igst_amount || invoice.total_tax || 0, currencySymbol)}
                          </td>
                        </tr>
                      ) : (
                        <>
                          <tr>
                            <td style={{ padding: '5px 14px', fontSize: '12.5px', color: '#4b5563', fontWeight: 600 }}>
                              CGST ({(invoice.gst_rate || 18) / 2}%):
                            </td>
                            <td style={{ padding: '5px 14px', fontSize: '12.5px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                              {formatCurrency(invoice.cgst_amount || 0, currencySymbol)}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '5px 14px', fontSize: '12.5px', color: '#4b5563', fontWeight: 600 }}>
                              SGST ({(invoice.gst_rate || 18) / 2}%):
                            </td>
                            <td style={{ padding: '5px 14px', fontSize: '12.5px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                              {formatCurrency(invoice.sgst_amount || 0, currencySymbol)}
                            </td>
                          </tr>
                        </>
                      )}
                      <tr>
                        <td style={{ padding: '7px 14px', fontSize: '13px', color: '#1e3a8a', fontWeight: 700, borderTop: '1px solid #e5e7eb' }}>
                          Total GST:
                        </td>
                        <td style={{ padding: '7px 14px', fontSize: '13px', textAlign: 'right', fontWeight: 700, color: '#1e3a8a', borderTop: '1px solid #e5e7eb' }}>
                          {formatCurrency(invoice.total_tax || 0, currencySymbol)}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={2} style={{ padding: '7px 14px', fontSize: '11.5px', color: '#047857', backgroundColor: '#ecfdf5', textAlign: 'center', fontWeight: 700 }}>
                        ✓ Non-GST Bill (Zero Tax Applied)
                      </td>
                    </tr>
                  )}

                  <tr style={{ backgroundColor: '#111827', color: '#ffffff' }}>
                    <td style={{ padding: '11px 14px', fontSize: '15px', fontWeight: 800 }}>
                      Grand Total:
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '17px', fontWeight: 800, textAlign: 'right', color: '#ffffff' }}>
                      {formatCurrency(invoice.grand_total || 0, currencySymbol)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 5. Authorized Signatory (Terms and Conditions completely removed) */}
      <div
        style={{
          marginTop: '36px',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          ...fontStyle
        }}
      >
        <div style={{ textAlign: 'right', minWidth: '220px' }}>
          <div style={{ width: '180px', borderTop: '1px solid #4b5563', marginLeft: 'auto', marginBottom: '8px' }} />
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>
            For {compName}
          </div>
          <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '2px' }}>
            Authorized Signatory
          </div>
        </div>
      </div>
    </div>
  );
}
