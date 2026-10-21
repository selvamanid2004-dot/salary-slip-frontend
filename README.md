# WorkPulse Frontend — React & Vite SPA

The client application for the Employee Management and Salary Slip Generation Suite. Built with React 19, Vite, Lucide Icons, and a custom CSS design system.

---

## 📁 Frontend Directory Structure

```text
frontend/
├── public/                     # Static public assets
├── src/
│   ├── components/             # Modular reusable components
│   │   ├── common/             # Buttons, modals, stat cards, badges
│   │   ├── employee/
│   │   │   └── EmployeeModal.jsx # Multi-tabbed employee profile creator/editor
│   │   ├── layout/
│   │   │   ├── Header.jsx      # Top bar with title, live MySQL status indicator
│   │   │   └── Sidebar.jsx     # Dark slate collapsible sidebar
│   │   └── payslip/
│   │       ├── GeneratePayrollModal.jsx # Live calculation & generation modal
│   │       ├── PayslipDocument.jsx      # Visual salary slip letterhead component
│   │       └── PayslipPreviewModal.jsx  # Interactive modal with Print/PDF export
│   ├── pages/                  # Main view screens
│   │   ├── Dashboard.jsx       # KPIs, quick links, department breakdown
│   │   ├── Employees.jsx       # Employee directory with search & filters
│   │   ├── Payroll.jsx         # Monthly payroll manager & slips history
│   │   └── Settings.jsx        # Company letterhead & MySQL diagnostics
│   ├── services/               # API communications layer
│   │   ├── api.js              # Centralized fetch wrapper
│   │   ├── companyService.js   # Company profile requests
│   │   ├── employeeService.js  # Employee CRUD requests
│   │   └── payrollService.js   # Payroll calculation & slip requests
│   ├── styles/                 # Pure CSS Design System
│   │   ├── components.css      # Table, modal, card, badge, toast styles
│   │   ├── global.css          # Resets, typography, layout foundation
│   │   ├── print.css           # Dedicated A4 portrait print rules
│   │   └── variables.css       # Design tokens (colors, shadows, radii)
│   ├── utils/
│   │   └── formatters.js       # Currency (₹), date, and month formatters
│   ├── App.jsx                 # Central coordinator for navigation & state
│   ├── index.css               # Design system root import
│   └── main.jsx                # React DOM root entrypoint
├── index.html                  # HTML entry with Google Fonts (Inter)
├── package.json
└── vite.config.js              # Vite server configuration with backend proxy
```

---

## 🎨 Design System Highlights

1. **Curated Color Tokens (`variables.css`)**:
   - Modern slate sidebar (`#0f172a`), royal blue brand accent (`#3b82f6`), and emerald green take-home salary banner (`#10b981`).
2. **Interactive Micro-Animations**:
   - Smooth sidebar collapsibility, subtle card lift on hover, and smooth tab transitions.
3. **Print & PDF Engine**:
   - `PayslipDocument.jsx` formats onto clean A4 paper margins using `@media print` rules from `styles/print.css`.
   - `PayslipPreviewModal.jsx` uses `html2canvas` and `jsPDF` for instant one-click client-side PDF downloads.

---

## 🏃 Running Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at **http://localhost:3000** and automatically proxies API requests (`/api/*`) to the backend at **http://localhost:5000**.
