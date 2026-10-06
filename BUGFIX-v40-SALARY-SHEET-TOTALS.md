# Salary Sheet Totals Layout Fix

The Employee Salary Payment Sheet totals were previously rendered as two long text lines, which could overlap or become difficult to read.

This fix changes the totals area to a structured 3-column grid of bordered summary boxes:
- Total Present
- Total Absent
- Total Leave
- Total OT Hours
- Total Basic / Earned
- Total OT Amount
- Total Allowances
- Total Deductions
- Total Net Salary

The values remain calculated from the actual generated payroll rows and are not hard-coded.
