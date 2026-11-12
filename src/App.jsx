/**
 * @file App.jsx
 * @description Main application controller and shell. Coordinates navigation tabs,
 * global modal controllers, database status checks, and toast alerts.
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import ChangePassword from './pages/ChangePassword';
import Login from './pages/Login';
import EmployeeModal from './components/employee/EmployeeModal';
import GeneratePayrollModal from './components/payslip/GeneratePayrollModal';
import BulkPayrollModal from './components/payslip/BulkPayrollModal';
import PayslipPreviewModal from './components/payslip/PayslipPreviewModal';
import AnnualStatementModal from './components/payslip/AnnualStatementModal';
import InvoiceModal from './components/billing/InvoiceModal';
import InvoicePreviewModal from './components/billing/InvoicePreviewModal';
import { employeeService } from './services/employeeService';
import { companyService } from './services/companyService';
import { authService } from './services/authService';
import { checkServerHealth } from './services/api';
import { CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';
import './styles/global.css';
import './styles/components.css';
import './styles/print.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedEmpForGeneration, setSelectedEmpForGeneration] = useState(null);

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewingSlip, setPreviewingSlip] = useState(null);

  const [isAnnualModalOpen, setIsAnnualModalOpen] = useState(false);
  const [selectedEmpForAnnual, setSelectedEmpForAnnual] = useState(null);

  // Billing & Quotations state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [initialInvoiceDocType, setInitialInvoiceDocType] = useState('invoice');
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
  const [previewingInvoice, setPreviewingInvoice] = useState(null);

  // Toast state
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Session verification on mount
  useEffect(() => {
    const verifySession = async () => {
      if (authService.isAuthenticated()) {
        try {
          const user = await authService.verifyToken();
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        } catch {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setCheckingAuth(false);
    };

    verifySession();
  }, []);

  // Initial data loading
  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [refreshTrigger, isAuthenticated]);

  const loadInitialData = async () => {
    try {
      const [health, comp, emps] = await Promise.all([
        checkServerHealth().catch(() => null),
        companyService.getCompany().catch(() => null),
        employeeService.getEmployees().catch(() => [])
      ]);

      if (health?.database) setDbStatus(health.database);
      if (comp) setCompany(comp);
      if (emps) setEmployees(emps);
    } catch (err) {
      console.error('Initial loading error:', err);
    }
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${user?.name || 'Administrator'}!`, 'success');
    triggerRefresh();
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    showToast('Signed out successfully.', 'info');
  };

  // Modal Handlers
  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenGenerateModal = (preselectedEmp = null) => {
    setSelectedEmpForGeneration(preselectedEmp);
    setIsGenerateModalOpen(true);
  };

  const handlePreviewSlip = (slip) => {
    setPreviewingSlip(slip);
    setIsPreviewModalOpen(true);
  };

  const handleOpenAnnualStatement = (empId = null) => {
    setSelectedEmpForAnnual(empId);
    setIsAnnualModalOpen(true);
  };

  const handleOpenCreateInvoice = (docType = 'invoice') => {
    setEditingInvoice(null);
    setInitialInvoiceDocType(docType);
    setIsInvoiceModalOpen(true);
  };

  const handleOpenEditInvoice = (doc) => {
    setEditingInvoice(doc);
    setInitialInvoiceDocType(doc.doc_type || 'invoice');
    setIsInvoiceModalOpen(true);
  };

  const handleOpenPreviewInvoice = (doc) => {
    setPreviewingInvoice(doc);
    setIsInvoicePreviewOpen(true);
  };

  const handleConvertQuotationInPreview = async (quotation) => {
    try {
      const createdInvoice = await invoiceService.convertQuotation(quotation.id);
      showToast(`Converted to official Invoice ${createdInvoice.doc_number}!`, 'success');
      triggerRefresh();
      setPreviewingInvoice(createdInvoice);
    } catch (err) {
      showToast(err.message || 'Failed to convert quotation', 'error');
    }
  };

  // 1. Session verification loading state
  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#ffffff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '40px', height: '40px' }} />
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>Verifying secure administrator session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Render Login Portal Gate
  if (!isAuthenticated) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        <div className="toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className={`toast ${toast.type}`}>
              {toast.type === 'success' && <CheckCircle2 size={18} color="var(--color-success)" />}
              {toast.type === 'error' && <AlertCircle size={18} color="var(--color-danger)" />}
              {toast.type === 'warning' && <AlertTriangle size={18} color="var(--color-warning)" />}
              <span className="toast-message">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      </>
    );
  }

  // 3. Authenticated: Render Main Application Suite
  return (
    <div className="app-container">
      {/* 1. Collapsible Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Area */}
      <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Header
          currentTab={currentTab}
          dbStatus={dbStatus}
          currentUser={currentUser}
          onLogout={handleLogout}
          onQuickAction={
            currentTab === 'employees'
              ? handleOpenAddEmployee
              : currentTab === 'payroll'
              ? () => handleOpenGenerateModal(null)
              : currentTab === 'billing'
              ? () => handleOpenCreateInvoice('invoice')
              : undefined
          }
          onRefresh={triggerRefresh}
        />

        <main className="page-body">
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigate={setCurrentTab}
              onPreviewSlip={handlePreviewSlip}
              showToast={showToast}
            />
          )}

          {currentTab === 'employees' && (
            <Employees
              onAddEmployee={handleOpenAddEmployee}
              onEditEmployee={handleOpenEditEmployee}
              onGenerateForEmployee={handleOpenGenerateModal}
              onOpenAnnualStatement={handleOpenAnnualStatement}
              showToast={showToast}
              refreshTrigger={refreshTrigger}
            />
          )}

          {currentTab === 'payroll' && (
            <Payroll
              employees={employees}
              onOpenGenerateModal={() => handleOpenGenerateModal(null)}
              onOpenBulkModal={() => setIsBulkModalOpen(true)}
              onOpenAnnualStatement={handleOpenAnnualStatement}
              onPreviewSlip={handlePreviewSlip}
              showToast={showToast}
              refreshTrigger={refreshTrigger}
            />
          )}

          {currentTab === 'billing' && (
            <Billing
              company={company}
              showToast={showToast}
              onOpenPreview={handleOpenPreviewInvoice}
              onOpenCreateModal={handleOpenCreateInvoice}
              onOpenEditModal={handleOpenEditInvoice}
              refreshTrigger={refreshTrigger}
            />
          )}

          {currentTab === 'settings' && (
            <Settings
              showToast={showToast}
              onCompanyUpdated={(updated) => setCompany(updated)}
            />
          )}

          {currentTab === 'change-password' && (
            <ChangePassword
              currentUser={currentUser}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* 3. Employee Add / Edit Modal */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        employee={editingEmployee}
        onSaved={triggerRefresh}
        showToast={showToast}
      />

      {/* 4. Single Issue Salary Slip Modal */}
      <GeneratePayrollModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        employees={employees}
        preselectedEmployee={selectedEmpForGeneration}
        onGenerated={(newSlip) => {
          triggerRefresh();
          handlePreviewSlip(newSlip);
        }}
        onViewExisting={(existingSlip) => {
          handlePreviewSlip(existingSlip);
        }}
        showToast={showToast}
      />

      {/* 5. Bulk Run Monthly Payroll Modal */}
      <BulkPayrollModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        employees={employees}
        onBulkGenerated={() => {
          triggerRefresh();
        }}
        showToast={showToast}
      />

      {/* 6. Salary Slip Document Preview & Print Modal */}
      <PayslipPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        payroll={previewingSlip}
        company={company}
      />

      {/* 7. 12-Month Annual Salary Statement Modal */}
      <AnnualStatementModal
        isOpen={isAnnualModalOpen}
        onClose={() => setIsAnnualModalOpen(false)}
        employees={employees}
        preselectedEmployeeId={selectedEmpForAnnual}
        company={company}
        showToast={showToast}
      />

      {/* 8. Billing Document Create / Edit Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        editingInvoice={editingInvoice}
        initialDocType={initialInvoiceDocType}
        company={company}
        onSaved={triggerRefresh}
        showToast={showToast}
      />

      {/* 9. Billing Document Preview & PDF Download Modal */}
      <InvoicePreviewModal
        isOpen={isInvoicePreviewOpen}
        onClose={() => setIsInvoicePreviewOpen(false)}
        invoice={previewingInvoice}
        company={company}
        onConvertToInvoice={handleConvertQuotationInPreview}
      />

      {/* 10. Centralized Toast Notification Stack */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={18} color="var(--color-success)" />}
            {toast.type === 'error' && <AlertCircle size={18} color="var(--color-danger)" />}
            {toast.type === 'warning' && <AlertTriangle size={18} color="var(--color-warning)" />}
            <span className="toast-message">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
