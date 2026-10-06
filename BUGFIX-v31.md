# v31 — Remove Employee Salary JSON / Allowances

- Removed Allowances, Bonuses, Other Earnings and Deductions JSON handling from the employee UI and HR API.
- Employee creation/update no longer reads or writes salary JSON fields.
- Payroll uses basic salary + attendance + overtime + system-managed advances; allowances/bonus/other earning JSON are not used.
- Payroll allowance amount is always zero for compatibility with the existing payroll schema.
- Salary reports and payroll UI no longer show Allowances.
- Fresh schema no longer creates the employee salary JSON columns. Existing databases may retain legacy columns for compatibility; they are ignored by the application.
- Position permission JSON remains because it is unrelated to employee salary and is used by Positions/Designations.
