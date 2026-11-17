/**
 * @file Header.jsx
 * @description Top navigation bar with responsive mobile menu toggle,
 * live MySQL diagnostics, dynamic title, and quick action launch buttons.
 */

import React from 'react';
import { Database, Plus, RefreshCw, LogOut, Menu, Briefcase } from 'lucide-react';

export default function Header({
  currentTab,
  dbStatus,
  onQuickAction,
  onRefresh,
  currentUser,
  onLogout,
  onToggleMobileMenu
}) {
  const titles = {
    dashboard: { title: 'Executive Dashboard', subtitle: 'Overview of workforce metrics and monthly payroll health' },
    employees: { title: 'Employee Directory', subtitle: 'Manage employee profiles, designations, and salary structures' },
    payroll: { title: 'Payroll & Salary Slips', subtitle: 'Generate, preview, print, and export official employee payslips' },
    billing: { title: 'IT Quotations & Billing', subtitle: 'Create, manage, and download GST and Non-GST IT service invoices and quotations' },
    settings: { title: 'Company & System Settings', subtitle: 'Configure company letterhead, tax identifiers, and MySQL connection' },
    'change-password': { title: 'Security & Password Management', subtitle: 'Manage software administrative access and update your credentials' }
  };

  const currentInfo = titles[currentTab] || titles.dashboard;
  const isMySQL = dbStatus?.isMySQL;
  const username = currentUser?.username || 'admin';
  const displayName = currentUser?.name || 'Administrator';

  return (
    <header className="top-header">
      <div className="header-left">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          type="button"
          className="mobile-hamburger-btn"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation drawer"
          title="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Mobile Mini Brand Icon */}
        <div className="mobile-brand-tag">
          <div className="mobile-brand-icon">
            <Briefcase size={18} />
          </div>
          <span className="mobile-brand-name">Work<span>Pulse</span></span>
        </div>

        {/* Desktop / Tablet Title Section */}
        <div className="header-title-section">
          <h1>{currentInfo.title}</h1>
          <p>{currentInfo.subtitle}</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Database Connectivity Status Indicator */}
        <div
          className={`db-pill ${isMySQL ? 'mysql' : 'mock'}`}
          title={
            isMySQL
              ? `Connected to MySQL: ${dbStatus.database} on ${dbStatus.host}`
              : `Operating in In-Memory Mode. Connect MySQL in backend/.env for live persistence.`
          }
        >
          <span className={`status-dot ${isMySQL ? 'green' : 'yellow'}`} />
          <Database size={13} />
          <span className="db-pill-text">{isMySQL ? 'MySQL Connected' : 'Mock DB'}</span>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button className="icon-btn header-refresh-btn" onClick={onRefresh} title="Refresh Data">
            <RefreshCw size={15} />
          </button>
        )}

        {/* Quick Action Button */}
        {currentTab === 'employees' && (
          <button className="btn btn-primary header-action-btn" onClick={onQuickAction}>
            <Plus size={16} />
            <span className="btn-label-text">Add Employee</span>
          </button>
        )}

        {currentTab === 'payroll' && (
          <button className="btn btn-primary header-action-btn" onClick={onQuickAction}>
            <Plus size={16} />
            <span className="btn-label-text">Issue Payslip</span>
          </button>
        )}

        {currentTab === 'billing' && (
          <button className="btn btn-primary header-action-btn" onClick={onQuickAction}>
            <Plus size={16} />
            <span className="btn-label-text">New Invoice</span>
          </button>
        )}

        {/* Current User Badge */}
        <div className="header-user-badge" title={`Signed in as ${displayName} (@${username})`}>
          <div className="header-user-avatar">
            {username.charAt(0).toUpperCase()}
          </div>
          <span className="header-user-name">{displayName}</span>
        </div>

        {/* Logout button */}
        {onLogout && (
          <button className="btn-header-logout" onClick={onLogout} title="Sign Out">
            <LogOut size={16} />
            <span className="logout-label-text">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
}
