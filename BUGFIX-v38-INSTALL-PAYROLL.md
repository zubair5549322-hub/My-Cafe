# v38 Installer + Payroll Hardening

## Installer
- The Windows launcher now uses `npm install` for the frontend instead of `npm ci` so an interrupted/partial `node_modules` directory can be repaired.
- The launcher prints an explicit progress message while frontend dependencies are being installed.
- The audit launcher uses the same repair-friendly install path.
- npm deprecation warnings are warnings, not application failures. The launcher now proceeds to the Vite build only after Vite is actually present.

## Payroll
- Payroll periods now retain `period_start` and `period_end` in SQLite, with automatic migration for existing databases.
- Salary payment correction no longer references undefined JavaScript/SQL aliases (`COALESCE(...)`, `p`, `pp`); it now loads the linked payroll entry explicitly.
- A payroll period cannot be marked `paid` until every generated salary payment is actually marked paid.
- Salary pay-sheet PDF refuses to print an empty payroll and returns a clear error instead of a blank document.
- All salary slips refuses to print an empty payroll period.
- The HR regression suite now covers payroll generation, persisted unpaid payment, salary-sheet PDF generation, marking salary paid, and creation of exactly one Salaries & Wages expense.

## Test note
This source package was statically checked with Node's syntax checker. Full dependency installation/build may still depend on the Windows machine's npm registry/network speed.
