# v36 — People Operations Final Redesign

- Reframed HR & Payroll as **People Operations** with a distinct enterprise workspace visual system.
- Renamed sidebar navigation to People Operations and Salary & Payments.
- Reworked HR header, navigation, cards, tables, controls, and modal/form layout.
- Added `/hr/login-roles` for active role selection by users with `system.user.manage`; role creation/management remains Super Admin controlled.
- Employee form now loads active login roles from the permission-appropriate endpoint.
- Existing employee, attendance, leave, overtime, payroll, salary payment, reporting and database functionality is preserved.
