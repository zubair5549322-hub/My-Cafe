// Central permission catalog, built-in roles, and request-to-permission mapping.
// All access decisions flow through this module; pages/routes do not hard-code role names.
const db = require('./db');

const PERMISSIONS = [
  ['dashboard.view','Dashboard'],
  ['employee.view','Employee Management — View Employees'],
  ['employee.add','Employee Management — Add Employee'],
  ['employee.edit','Employee Management — Edit Employee'],
  ['employee.delete','Employee Management — Delete Employee'],
  ['employee.salary.view','Employee Management — View Salary'],
  ['employee.salary.edit','Employee Management — Edit Salary'],
  ['position.view','Positions / Designations — View'],
  ['position.add','Positions / Designations — Add'],
  ['position.edit','Positions / Designations — Edit'],
  ['position.delete','Positions / Designations — Delete'],
  ['attendance.view','Attendance — View Attendance'],
  ['attendance.add','Attendance — Add IN/OUT'],
  ['attendance.edit','Attendance — Edit Attendance'],
  ['attendance.approve','Attendance — Approve Attendance'],
  ['attendance.delete','Attendance — Delete Attendance'],
  ['attendance.overtime.view','Attendance — View Overtime'],
  ['attendance.overtime.manage','Attendance — Manage Overtime Rules'],
  ['attendance.process','Attendance — Process Monthly Attendance'],
  ['attendance.settings','Attendance — Shifts & Working Hours'],
  ['leave.view','Leave — View Leave'],
  ['leave.apply','Leave — Apply Leave'],
  ['leave.approve','Leave — Approve Leave'],
  ['leave.edit','Leave — Edit Leave'],
  ['leave.delete','Leave — Delete Leave'],
  ['payroll.view','Payroll — View Payroll'],
  ['payroll.generate.individual','Payroll — Generate Individual Payroll'],
  ['payroll.generate.all','Payroll — Generate All Payroll'],
  ['payroll.edit','Payroll — Edit Payroll'],
  ['payroll.approve','Payroll — Approve Payroll'],
  ['payroll.lock','Payroll — Lock Payroll'],
  ['payroll.unlock','Payroll — Unlock Payroll'],
  ['payroll.salary_slip.view','Payroll — View Salary Slip'],
  ['payroll.salary_slip.print','Payroll — Print Salary Slip'],
  ['payroll.export','Payroll — Export Payroll'],
  ['payroll.reports','Payroll — Payroll Reports'],
  ['payroll.payment.view','Salary Payments — View Payment Status & History'],
  ['payroll.payment.manage','Salary Payments — Mark Salaries Paid'],
  ['payroll.pay_sheet.print','Salary Payments — Print Monthly Pay Sheet'],
  ['reports.salary','Reports — Salary Reports'],
  ['pos.access','POS — Access POS'],
  ['pos.sale.create','POS — Create Sale'],
  ['pos.sale.cancel','POS — Cancel Sale'],
  ['pos.refund','POS — Refund'],
  ['pos.discount','POS — Apply Discount'],
  ['pos.sales_reports','POS — View Sales Reports'],
  ['inventory.view','Inventory — View Inventory'],
  ['inventory.add','Inventory — Add Stock'],
  ['inventory.edit','Inventory — Edit Stock'],
  ['inventory.adjust','Inventory — Stock Adjustment'],
  ['inventory.purchase','Inventory — Purchase'],
  ['inventory.supplier','Inventory — Supplier Management'],
  ['inventory.reports','Inventory — Inventory Reports'],
  ['reports.attendance','Reports — Attendance Reports'],
  ['reports.payroll','Reports — Payroll Reports'],
  ['reports.sales','Reports — Sales Reports'],
  ['reports.inventory','Reports — Inventory Reports'],
  ['reports.financial','Reports — Financial Reports'],
  ['system.user.manage','System — User Management'],
  ['system.role.manage','System — Role Management'],
  ['system.settings','System — System Settings'],
  ['system.backup','System — Database/Backup Management'],
  ['activity.view','System — Audit Log'],
  ['dayclose.view','Day Close — View'],
  ['dayclose.manage','Day Close — Manage'],
  ['kitchen.access','Kitchen — Access Display'],
  ['kitchen.update','Kitchen — Update KOT Status'],
  ['products.view','Menu — View Products'],
  ['products.manage','Menu — Manage Products'],
  ['recipes.view','Recipes — View'],
  ['recipes.manage','Recipes — Manage'],
  ['recipes.lock','Recipes — Lock / Unlock'],
  ['tables.view','Tables — View'],
  ['tables.manage','Tables — Manage'],
  ['customers.view','Customers — View'],
  ['customers.manage','Customers — Manage'],
  ['suppliers.view','Suppliers — View'],
  ['suppliers.manage','Suppliers — Manage'],
  ['expenses.view','Expenses — View'],
  ['expenses.manage','Expenses — Manage'],
  ['expenses.delete','Expenses — Delete'],
  ['order_log.view','Order Log — View'],
  ['my_account.view','My Account'],
];

const ALL = PERMISSIONS.map(([key]) => key);
const P = (...xs) => xs;
const ROLE_DEFINITIONS = {
  'Super Admin': ALL,
  'Admin': ALL.filter(k => !['system.role.manage','system.user.manage','system.settings','system.backup'].includes(k)),
  'HR Manager': P('dashboard.view','employee.view','employee.add','employee.edit','employee.delete','employee.salary.view','employee.salary.edit','attendance.view','attendance.add','attendance.edit','attendance.approve','attendance.delete','attendance.overtime.view','attendance.overtime.manage','attendance.process','attendance.settings','leave.view','leave.apply','leave.approve','leave.edit','leave.delete','payroll.view','payroll.generate.individual','payroll.generate.all','payroll.edit','payroll.approve','payroll.lock','payroll.unlock','payroll.salary_slip.view','payroll.salary_slip.print','payroll.export','reports.attendance','reports.payroll','reports.salary','payroll.payment.view','my_account.view'),
  'HR Officer': P('dashboard.view','employee.view','employee.add','employee.edit','employee.salary.view','attendance.view','attendance.add','attendance.edit','attendance.overtime.view','attendance.overtime.manage','attendance.process','attendance.settings','leave.view','leave.apply','leave.edit','payroll.view','payroll.generate.individual','payroll.generate.all','payroll.salary_slip.view','payroll.salary_slip.print','payroll.reports','reports.attendance','reports.payroll','reports.salary','payroll.payment.view','my_account.view'),
  'Manager': P('dashboard.view','attendance.view','attendance.edit','attendance.approve','attendance.overtime.view','attendance.overtime.manage','reports.attendance','pos.access','pos.sale.create','pos.sale.cancel','pos.refund','pos.discount','pos.sales_reports','inventory.view','inventory.add','inventory.edit','inventory.adjust','inventory.purchase','inventory.supplier','inventory.reports','reports.sales','reports.inventory','reports.financial','tables.view','tables.manage','customers.view','customers.manage','suppliers.view','suppliers.manage','expenses.view','expenses.manage','order_log.view','dayclose.view','dayclose.manage','kitchen.access','kitchen.update','products.view','products.manage','recipes.view','recipes.manage','my_account.view'),
  'Supervisor': P('dashboard.view','pos.access','pos.sale.create','pos.sale.cancel','pos.discount','inventory.view','inventory.add','inventory.adjust','tables.view','tables.manage','customers.view','order_log.view','dayclose.view','dayclose.manage','kitchen.access','kitchen.update','products.view','recipes.view','reports.sales','reports.inventory','my_account.view'),
  'Accountant': P('dashboard.view','employee.view','employee.salary.view','payroll.view','payroll.salary_slip.view','payroll.salary_slip.print','payroll.export','payroll.payment.view','payroll.payment.manage','payroll.pay_sheet.print','reports.payroll','reports.salary','reports.sales','reports.financial','expenses.view','expenses.manage','my_account.view'),
  'Cashier': P('dashboard.view','pos.access','pos.sale.create','pos.sale.cancel','pos.refund','pos.discount','pos.sales_reports','tables.view','tables.manage','customers.view','customers.manage','order_log.view','dayclose.view','dayclose.manage','products.view','products.manage','recipes.view','recipes.manage','inventory.view','inventory.add','inventory.edit','inventory.purchase','inventory.supplier','suppliers.view','suppliers.manage','expenses.view','expenses.manage','my_account.view'),
  'POS Operator': P('dashboard.view','pos.access','pos.sale.create','tables.view','customers.view','order_log.view','products.view','my_account.view'),
  'Inventory Manager': P('dashboard.view','inventory.view','inventory.add','inventory.edit','inventory.adjust','inventory.purchase','inventory.supplier','inventory.reports','suppliers.view','suppliers.manage','expenses.view','reports.inventory','my_account.view'),
  'Purchase Officer': P('dashboard.view','inventory.view','inventory.add','inventory.purchase','inventory.supplier','suppliers.view','suppliers.manage','my_account.view'),
  'Store Keeper': P('dashboard.view','inventory.view','inventory.add','inventory.edit','inventory.adjust','inventory.reports','my_account.view'),
  'Kitchen Staff': P('dashboard.view','kitchen.access','kitchen.update','my_account.view'),
  'Employee': P('dashboard.view','attendance.view','attendance.overtime.view','leave.view','leave.apply','payroll.salary_slip.view','payroll.salary_slip.print','my_account.view'),
  'Custom Role': [],
};

// Legacy login roles are retained only as a migration fallback for old installs.
const LEGACY_ROLE_TO_BUILTIN = { admin: 'Super Admin', cashier: 'Cashier', kitchen: 'Kitchen Staff' };

function seedRoles() {
  const up = db.prepare(`INSERT OR IGNORE INTO roles (name, description, is_system, active) VALUES (?, ?, 1, 1)`);
  const insPerm = db.prepare(`INSERT OR IGNORE INTO role_permissions (role_id, permission) VALUES (?, ?)`);
  for (const [name, perms] of Object.entries(ROLE_DEFINITIONS)) {
    up.run(name, `${name} built-in role`);
    const role = db.prepare('SELECT id FROM roles WHERE name=?').get(name);
    for (const permission of perms) insPerm.run(role.id, permission);
  }
}

function getUserPermissions(user) {
  if (!user) return new Set();
  seedRoles();
  if (user.is_super_admin) return new Set(ALL);
  let roleNames = [];
  if (user.employee_id) {
    roleNames = db.prepare(`SELECT r.name FROM employee_roles er JOIN roles r ON r.id=er.role_id WHERE er.employee_id=? AND r.active=1`).all(user.employee_id).map(r => r.name);
  }
  if (!roleNames.length && LEGACY_ROLE_TO_BUILTIN[user.role]) roleNames = [LEGACY_ROLE_TO_BUILTIN[user.role]];
  const permissions = new Set();
  if (roleNames.length) {
    const qs = roleNames.map(() => '?').join(',');
    db.prepare(`SELECT DISTINCT rp.permission FROM role_permissions rp JOIN roles r ON r.id=rp.role_id WHERE r.name IN (${qs}) AND r.active=1`).all(...roleNames).forEach(r => permissions.add(r.permission));
  }
  if (user.employee_id) {
    const overrides = db.prepare('SELECT permission, allowed FROM employee_permission_overrides WHERE employee_id=?').all(user.employee_id);
    for (const o of overrides) { if (o.allowed) permissions.add(o.permission); else permissions.delete(o.permission); }
  }
  return permissions;
}

function requiredPermission(req) {
  const rawPath = req.route?.path || req.path;
  const p = rawPath.startsWith('/hr/') ? rawPath.slice(3) : rawPath;
  const m = req.method;
  if (p === '/me' || p === '/me/password') return 'my_account.view';
  if (p === '/users' || p === '/users/:id') return 'system.user.manage';
  if (p === '/roles' || p === '/roles/:id' || p === '/roles/:id/duplicate' || p === '/roles/:id/active' || p === '/roles/:id/employees') return 'system.role.manage';
  if (p === '/my-attendance') return 'attendance.view';
  if (p === '/my-payroll') return 'payroll.salary_slip.view';
  if (p === '/employees' || p === '/employees/:id') return m === 'GET' ? 'employee.view' : m === 'DELETE' ? 'employee.delete' : 'employee.edit';
  if (p === '/attendance' || p === '/attendance/:id' || p === '/employees/:id/attendance') return m === 'GET' ? 'attendance.view' : m === 'DELETE' ? 'attendance.delete' : m === 'POST' ? 'attendance.add' : 'attendance.edit';
  if (p === '/attendance/process') return 'attendance.process';
  if (p === '/shifts' || p === '/shifts/:id') return m === 'GET' ? 'attendance.view' : 'attendance.settings';
  if (p === '/overtime-rules' || p === '/overtime-rules/:id') return m === 'GET' ? 'attendance.overtime.view' : 'attendance.overtime.manage';
  if (p === '/settings') return m === 'GET' ? 'employee.view' : 'system.settings';
  if (p === '/leave' || p === '/leave/:id') return m === 'GET' ? 'leave.view' : m === 'DELETE' ? 'leave.delete' : m === 'POST' ? 'leave.apply' : 'leave.edit';
  if (p === '/advances' || p === '/advances/:id/recover') return m === 'GET' ? 'payroll.view' : 'payroll.edit';
  if (p === '/salary-payments' || p === '/salary-payments/:id' || p === '/salary-payments/bulk-pay' || p === '/salary-payments/:id/pay') return m === 'GET' ? 'payroll.payment.view' : 'payroll.payment.manage';
  if (p === '/salary-pay-sheet/pdf') return 'payroll.pay_sheet.print';
  if (p === '/payroll') return 'payroll.view';
  if (p === '/payroll/preview') return 'payroll.generate.individual';
  if (p === '/holidays' || p === '/holidays/:id') return m === 'GET' ? 'attendance.view' : 'attendance.settings';
  if (p === '/payroll/generate') return 'payroll.generate.all';
  if (p === '/payroll/generate-individual') return 'payroll.generate.individual';
  if (p === '/payroll/:id/status') return 'payroll.edit';
  if (p === '/payroll/:periodId/employee/:employeeId') return 'payroll.view';
  if (p === '/payroll/:periodId/slip/:employeeId/pdf' || p === '/payroll/:periodId/slips/pdf') return 'payroll.salary_slip.print';
  if (p === '/reports/:type' || p === '/reports/:type/export/xlsx' || p === '/reports/:type/export/pdf') return req.params?.type === 'salary' ? 'reports.salary' : req.params?.type === 'payroll' ? 'reports.payroll' : 'reports.attendance';
  if (p === '/dashboard') return 'employee.view';
  if (p === '/settings') return m === 'GET' ? 'system.settings' : 'system.settings';
  if (p === '/settings/preference') return 'my_account.view';
  if (p === '/activity-log' || p === '/activity-log/action-types') return 'activity.view';
  if (p === '/golive/status' || p === '/golive/reset') return 'system.settings';
  if (p === '/dashboard') return 'dashboard.view';
  if (p === '/kitchen/queue') return 'kitchen.access';
  if (p === '/kitchen/items/:itemId/status') return 'kitchen.update';
  if (p === '/orders' && m === 'POST') return 'pos.sale.create';
  if (p === '/orders/active' || p === '/orders/log' || p === '/orders/:id') return p === '/orders/log' ? 'order_log.view' : 'pos.access';
  if (p === '/orders/:id/items' || p === '/orders/:id/items/:itemId') return 'pos.sale.create';
  if (p === '/orders/:id/discount') return 'pos.discount';
  if (p === '/orders/:id/kot') return 'pos.sale.create';
  if (p === '/orders/:id/hold' || p === '/orders/:id/resume' || p === '/orders/:id/split' || p === '/orders/:id/complete') return 'pos.sale.create';
  if (p === '/orders/:id/cancel') return 'pos.sale.cancel';
  if (p === '/categories' || p === '/products' || p === '/addons') return m === 'GET' ? 'products.view' : 'products.manage';
  if (p === '/categories/:id' || p === '/products/:id' || p === '/products/:id/variants' || p === '/variants/:id' || p === '/addons' || p === '/products/:id/addons/:addonId') return 'products.manage';
  if (p === '/recipes' || p === '/recipes/product/:productId') return m === 'GET' ? 'recipes.view' : 'recipes.manage';
  if (p === '/recipes/:id/lock') return 'recipes.lock';
  if (p === '/raw-materials' || p === '/raw-materials-low-stock' || p === '/raw-materials/:id/transactions') return m === 'GET' ? 'inventory.view' : 'inventory.edit';
  if (p === '/raw-materials/:id/stock-entry') return 'inventory.add';
  if (p === '/suppliers' || p === '/purchases') return m === 'GET' ? 'inventory.supplier' : 'inventory.purchase';
  if (p === '/suppliers/:id' || p === '/purchases/:id/pay') return 'inventory.supplier';
  if (p === '/expenses') return m === 'GET' ? 'expenses.view' : 'expenses.manage';
  if (p === '/expenses/:id') return m === 'DELETE' ? 'expenses.delete' : 'expenses.manage';
  if (p === '/tables') return m === 'GET' ? 'tables.view' : 'tables.manage';
  if (p === '/tables/:id' || p === '/tables/:idA/merge/:idB' || p === '/tables/:id/unmerge') return 'tables.manage';
  if (p === '/customers' || p === '/customers/:id') return m === 'GET' ? 'customers.view' : 'customers.manage';
  if (p === '/reports/:type' || p === '/reports/:type/export/xlsx' || p === '/reports/:type/export/pdf') {
    const type = req.params?.type;
    return type === 'attendance' ? 'reports.attendance' : type === 'payroll' ? 'reports.payroll' : type === 'inventory' ? 'reports.inventory' : type === 'financial' || type === 'profit' || type === 'expense' ? 'reports.financial' : type === 'salary' ? 'reports.salary' : 'reports.sales';
  }
  if (p === '/day-close' || p === '/day-close/:date') return m === 'GET' ? 'dayclose.view' : 'dayclose.manage';
  return null;
}

module.exports = { PERMISSIONS, ALL, ROLE_DEFINITIONS, LEGACY_ROLE_TO_BUILTIN, seedRoles, getUserPermissions, requiredPermission };
