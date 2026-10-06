# v22 — Employee Save + Working Days/Hours Calculation Fix

## Fixed
- New employees are returned from the POST `/api/hr/employees` endpoint after the transaction commits.
- HR People list now immediately updates from the saved database record and then refreshes from the API.
- Employee-list API errors are shown in the People tab instead of silently leaving an empty table.
- Existing employee edit/delete refreshes the list after completion.

## Salary configuration
- Added `working_days_per_month` employee setting.
- If set, salary daily rate = monthly basic salary / configured working days.
- If blank, salary uses the actual scheduled working days for the selected month based on weekly off.
- Hourly rate = daily rate / configured working hours per day.
- Working hours can come from the employee override or selected shift.
- Shift weekly-off is used when the employee has no explicit weekly-off override.
- Payroll uses the employee working-days/month setting when provided, otherwise actual scheduled working days.
- Validation prevents invalid working-days/month (>31) and working-hours/day (>24).

## Database migration
Existing databases receive `employees.working_days_per_month` automatically; no employee/POS/inventory/sales data is removed.
