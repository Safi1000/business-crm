import type { Employee, Paged } from '@/types';
import { db, nextId } from './db';
import { paginate, resolve, sortRows, textMatch, type ListParams } from './transport';

export interface EmployeeFilters extends ListParams {
  branch?: string;
  department?: string;
  type?: string;
  status?: string;
  shift?: string;
}

export const employeesApi = {
  list(params: EmployeeFilters = {}): Promise<Paged<Employee>> {
    let rows = db.employees.filter(
      (e) =>
        textMatch([e.name, e.code, e.email, e.phone], params.search) &&
        (!params.branch || e.branchId === params.branch) &&
        (!params.department || e.departmentId === params.department) &&
        (!params.type || e.type === params.type) &&
        (!params.status || e.status === params.status) &&
        (!params.shift || e.shift === params.shift),
    );
    rows = sortRows(rows, params, {
      name: (e) => e.name,
      code: (e) => e.code,
      department: (e) => e.department,
      branch: (e) => e.branch,
      joinDate: (e) => e.joinDate,
    });
    return resolve(paginate(rows, params));
  },

  get(id: string): Promise<Employee | undefined> {
    return resolve(db.employees.find((e) => e.id === id));
  },

  create(data: Partial<Employee>): Promise<Employee> {
    const dept = db.departments.find((d) => d.id === data.departmentId) ?? db.departments[0]!;
    const branch = db.branches.find((b) => b.id === data.branchId) ?? db.branches[0]!;
    const emp: Employee = {
      id: nextId('emp'),
      code: `EMP-${String(db.employees.length + 1).padStart(4, '0')}`,
      name: data.name ?? 'New Employee',
      email: data.email ?? '',
      phone: data.phone ?? '',
      country: data.country ?? 'Pakistan',
      type: data.type ?? 'Full-time',
      departmentId: dept.id,
      department: dept.name,
      branchId: branch.id,
      branch: branch.name,
      joinDate: data.joinDate ?? new Date().toISOString().slice(0, 10),
      shift: data.shift ?? 'Morning',
      status: 'Active',
      baseSalary: data.baseSalary ?? 0,
      currency: data.currency ?? 'PKR',
      docsComplete: false,
      docsCount: 0,
      docsRequired: 5,
      ...data,
    };
    db.employees.unshift(emp);
    return resolve(emp);
  },

  update(id: string, data: Partial<Employee>): Promise<Employee> {
    const idx = db.employees.findIndex((e) => e.id === id);
    if (idx < 0) throw new Error('Employee not found');
    db.employees[idx] = { ...db.employees[idx]!, ...data };
    return resolve(db.employees[idx]!);
  },
};
