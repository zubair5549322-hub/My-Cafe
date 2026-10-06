# Payroll Fix v37 — Real Data Flow

This update fixes the existing HR/payroll pipeline. It does not create a demo payroll.

## Fixed
- Payroll generation now validates active employees and salary data and returns the created payroll entries.
- Payroll generation stores `allowances` correctly and includes configured monthly allowances/deductions from the employee master.
- Existing databases are upgraded with missing payroll/employee salary columns instead of silently failing on legacy schemas.
- Payroll check/preview for all active employees is available before generation.
- Generated payroll remains in SQLite and survives refresh/restart.
- Salary Payments now reads generated payroll entries directly, while still creating unpaid salary-payment records for payment workflow.
- Salary Sheet PDF is populated from real generated payroll records and supports unpaid as well as paid rows.
- Selected employees on the Salary Sheet now filter by employee ID rather than confusing salary-payment IDs with employee IDs.
- Added an Employee Day Close / Daily Attendance PDF for a selected employee and exact date, including IN/OUT, hours, OT, status and signatures.
- Added an automated payroll persistence regression test.

## Validation performed in this build
- All backend JavaScript files pass `node --check`.
- SQLite schema was loaded in an isolated in-memory database and a representative employee → attendance → payroll insert was executed successfully.
- Payroll INSERT field/value counts were checked: 23 columns / 23 placeholders.

## Runtime note
The full npm integration suite still needs to be executed on a machine where the project dependencies can be installed. Do not treat this package as 100% end-to-end certified until `RUN-FULL-AUDIT.bat` completes successfully.
