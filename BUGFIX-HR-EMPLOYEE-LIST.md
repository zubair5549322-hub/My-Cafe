# HR Employee Save/List Fix

## Root cause
The `POST /api/hr/employees` INSERT statement had **38 `?` placeholders** while the employees INSERT contains **34 columns/values**.

`better-sqlite3` rejects that statement, so the employee could not be committed even though the form flow appeared to proceed.

## Fix
The INSERT now contains exactly **34 placeholders for 34 employee fields**.

The existing employee regression test also verifies:
- employee creation returns HTTP 201
- employee remains present after a fresh `GET /hr/employees`
- position and role persist
- salary persists
- edits persist
- employee login is linked to the selected role

## UI improvement
The Employees table now shows an explicit empty-state row when there are no records, instead of displaying a completely blank table body.
