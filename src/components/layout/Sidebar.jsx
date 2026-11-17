/**
 * @file Sidebar.jsx
 * @description Main application navigation sidebar with desktop collapsing
 * and mobile overlay app drawer navigation.
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  ReceiptText,
  FileText,
  Building2,
  KeyRound,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  X
} from 'lucide-react';

export default function Sidebar({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  isOpenMobile,
  onCloseMobile,
  onLogout
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'payroll', label: 'Payroll & Payslips', icon: ReceiptText },
    { id: 'billing', label: 'Quotations & Billing', icon: FileText },
    { id: 'settings', label: 'Company & Settings', icon: Building2 },
    { id: 'change-password', label: 'Change Password', icon: KeyRound }
  ];

  const handleNavClick = (tabId) => {
    setCurrentTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleLogoutClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${isOpenMobile ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <Briefcase size={22} />
          </div>
          {(!collapsed || isOpenMobile) && (
            <div className="brand-text">
              Work<span>Pulse</span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          className="sidebar-toggle-btn desktop-only-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle sidebar collapse"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Mobile Drawer Close Button */}
        <button
          type="button"
          className="sidebar-mobile-close-btn"
          onClick={onCloseMobile}
          title="Close Navigation"
          aria-label="Close navigation drawer"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              title={collapsed && !isOpenMobile ? item.label : undefined}
            >
              <Icon size={20} />
              {(!collapsed || isOpenMobile) && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {onLogout && (
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogoutClick}
            title={collapsed && !isOpenMobile ? 'Sign Out' : undefined}
          >
            <LogOut size={18} />
            {(!collapsed || isOpenMobile) && <span>Sign Out</span>}
          </button>
        )}
        {(!collapsed || isOpenMobile) && (
          <div className="sidebar-version-tag">
            WorkPulse v1.0 • Enterprise
          </div>
        )}
      </div>
    </aside>
  );
}
