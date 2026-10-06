# v21 — Employee Salary Auto-Calculation Fix

## Fixed
The Employee Add/Edit salary form was displaying `0.00` for Calculated per day and Calculated per hour because the frontend contained placeholder zero values.

## New behavior
- Daily salary is calculated live as monthly basic salary divided by the actual scheduled working days in the current calculation month.
- Hourly salary is calculated live as daily salary divided by configured working hours.
- Working days respect the employee weekly-off override, selected shift weekly off, or Sunday fallback.
- OT rate uses the employee's configured direct OT rate, otherwise the selected OT rule's direct OT rate, otherwise the calculated hourly rate.
- Values recalculate immediately when Basic Salary, Working Hours, Shift, Weekly Off, or OT Rate changes.
- The form clearly states the display calculation month and that final payroll recalculates using the actual selected payroll month.
- No fixed 26-day divisor and no 1.5x OT multiplier were introduced.

Example for September 2026 with Sunday weekly off and 8 working hours/day:
- Basic Salary Rs. 40,000
- Working Days 26
- Per Day Rs. 1,538.46
- Per Hour Rs. 192.31
- OT Rate falls back to Rs. 192.31 when no direct OT rate is configured.

Existing payroll backend calculation remains month-specific and continues to use the selected payroll month's actual working days.
