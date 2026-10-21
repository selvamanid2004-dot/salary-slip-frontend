/**
 * @file Sidebar.jsx
 * @description Main application navigation sidebar with collapsible layout.
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  ReceiptText,
  Building2,
  KeyRound,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, collapsed, setCollapsed, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'payroll', label: 'Payroll & Payslips', icon: ReceiptText },
    { id: 'settings', label: 'Company & Settings', icon: Building2 },
    { id: 'change-password', label: 'Change Password', icon: KeyRound }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <Briefcase size={22} />
          </div>
          {!collapsed && (
            <div className="brand-text">
              Work<span>Pulse</span>
            </div>
          )}
        </div>
        <button
          className="sidebar-toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {onLogout && (
          <button
            className="sidebar-logout-btn"
            onClick={onLogout}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        )}
        {!collapsed && (
          <div style={{ fontSize: '11px', color: 'var(--text-sidebar)', textAlign: 'center', marginTop: '6px' }}>
            WorkPulse v1.0 • Enterprise
          </div>
        )}
      </div>
    </aside>
  );
}
