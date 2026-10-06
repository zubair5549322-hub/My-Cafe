# v33 — Employee Form Required Fields & Salary JSON Removal

## Employee add/edit
- Only **Employee Name** and **TP Number** are required.
- Employee Code, father name, CNIC, email, department, join date, position, salary, working days/hours, shift, OT, bank details, address and login are optional.
- TP Number uses the existing `phone` database field and is displayed as `TP Number` in the employee form.
- Login fields become required only when the user explicitly enables system login.
- New employees without a login are saved normally.

## Salary JSON / allowances
- Removed all employee-form JSON salary fields.
- Removed employee payroll calculation use of allowances/bonuses/other-earning JSON.
- Removed unsafe `saved.allowances` response mutation that caused the repeated `Cannot set properties of undefined (setting 'allowances')` error.
- Legacy database columns, if present in an existing database, are not used by the employee module.

## Join date compatibility
- Existing SQLite schema may retain `join_date NOT NULL`; when a new employee leaves Join Date blank, the application stores an empty string so no schema-breaking migration is required.
