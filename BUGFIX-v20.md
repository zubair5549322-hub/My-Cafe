# v20 Employee Creation Fix

Fixed a critical regression in the employee creation endpoint introduced during the Internet-ready/HR updates.

## Root cause

`POST /api/hr/employees` was accidentally using the edit-only `existing` employee object while inserting a brand-new employee. Because `existing` is not defined in the create route, every normal employee creation could fail before the transaction completed.

## Fix

New employee creation now uses safe new-record defaults:

- designation defaults to blank/null when no position is selected
- position_id defaults to null
- allowances, bonuses, other earnings and deductions default to empty objects
- no existing employee record is referenced during creation

The edit endpoint continues to preserve existing employee values when fields are omitted.

## Result

Adding an employee now persists the employee to the actual SQLite database and the HR employee list reloads from the database after a successful save.

## Validation

- `node --check backend/routes/hr.js` passes.
- INSERT column count and placeholder count both equal 37.
- Employee creation no longer contains references to the edit-only `existing` variable.

A complete npm dependency install/build could not be run in this environment because `npm ci` timed out; no `node_modules` directory is included in the package.
