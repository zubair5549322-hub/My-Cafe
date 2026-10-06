# Bug Fix v39 — Salary Sheet, Locked Payroll Payments, and IN/OUT Overtime

## Fixed

1. **Salary Payment Sheet formatting**
   - Uses actual generated payroll records.
   - Added Present, Absent, Leave, OT Hours, Basic/Earned, OT Amount, Allowances, Deductions, Net Salary and Signature columns.
   - Added totals for Present, Absent, Leave, OT Hours, Basic/Earned, OT Amount, Allowances, Deductions and Net Salary.
   - Uses the configured cafe name (`cafe_name`) in the PDF heading.
   - Landscape A4 column widths are constrained to the printable area.

2. **Locked payroll payment**
   - Locking payroll no longer blocks the actual salary payment.
   - A locked payroll can be paid from Salary & Payments.
   - A locked payroll can be unlocked by an authorized user so it can be recalculated.
   - Unlocking is prevented after a salary payment has already been recorded for that payroll period, to protect the accounting trail.
   - Paid payroll remains immutable.

3. **Overtime from IN/OUT**
   - Attendance API output recalculates hours/OT from IN + OUT whenever both times are present.
   - Month attendance sheet recalculates from IN/OUT for existing records.
   - Payroll attendance summary uses the live IN/OUT calculation, so older attendance rows with stale stored OT values are corrected for payroll calculation.
   - Employee Day Close PDF also uses the live IN/OUT calculation.

4. **Regression coverage**
   - Existing payroll/employee regression test retained.
   - Test coverage now verifies locked payroll payment behavior and IN/OUT overtime calculations.

## Note

The current environment could not complete a full npm dependency installation within the available execution window, so a full 33-test runtime certification was not possible here. Backend JavaScript syntax checks and targeted static checks were completed.
