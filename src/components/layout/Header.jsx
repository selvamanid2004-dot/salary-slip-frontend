/**
 * @file Header.jsx
 * @description Top navigation bar displaying page context, live MySQL status, and quick action buttons.
 */

import React from 'react';
import { Database, Plus, RefreshCw, LogOut } from 'lucide-react';

export default function Header({ currentTab, dbStatus, onQuickAction, onRefresh, currentUser, onLogout }) {
  const titles = {
    dashboard: { title: 'Executive Dashboard', subtitle: 'Overview of workforce metrics and monthly payroll health' },
    employees: { title: 'Employee Directory', subtitle: 'Manage employee profiles, designations, and salary structures' },
    payroll: { title: 'Payroll & Salary Slips', subtitle: 'Generate, preview, print, and export official employee payslips' },
    settings: { title: 'Company & System Settings', subtitle: 'Configure company letterhead, tax identifiers, and MySQL connection' },
    'change-password': { title: 'Security & Password Management', subtitle: 'Manage software administrative access and update your credentials' }
  };

  const currentInfo = titles[currentTab] || titles.dashboard;
  const isMySQL = dbStatus?.isMySQL;
  const username = currentUser?.username || 'admin';
  const displayName = currentUser?.name || 'Administrator';

  return (
    <header className="top-header">
      <div className="header-title-section">
        <h1>{currentInfo.title}</h1>
        <p>{currentInfo.subtitle}</p>
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
          <span>{isMySQL ? 'MySQL Connected' : 'Mock DB Mode'}</span>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button className="icon-btn" onClick={onRefresh} title="Refresh Data">
            <RefreshCw size={15} />
          </button>
        )}

        {/* Quick Action Button */}
        {currentTab === 'employees' && (
          <button className="btn btn-primary" onClick={onQuickAction}>
            <Plus size={16} />
            Add Employee
          </button>
        )}

        {currentTab === 'payroll' && (
          <button className="btn btn-primary" onClick={onQuickAction}>
            <Plus size={16} />
            Issue Payslip
          </button>
        )}

        {/* Current User Badge */}
        <div className="header-user-badge" title={`Signed in as ${displayName} (@${username})`}>
          <div className="header-user-avatar">
            {username.charAt(0).toUpperCase()}
          </div>
          <span>{displayName}</span>
        </div>

        {/* Logout button */}
        {onLogout && (
          <button className="btn-header-logout" onClick={onLogout} title="Sign Out">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
}
