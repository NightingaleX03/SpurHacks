import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnterpriseService, EnterpriseUser, DiagramResource, CodebaseResource, ResourcePermissions } from '../../../services/enterprise.service';
import { FormsModule } from '@angular/forms';

type PermissionKey = keyof EnterpriseUser['permissions'];

@Component({
  selector: 'app-enterprise-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col">
      <h2 class="text-2xl font-bold text-white mb-6">Enterprise Management</h2>
      <ng-container *ngIf="isEmployer; else employeeView">
        <!-- EMPLOYER VIEW -->
        <div class="mb-8">
          <h3 class="text-xl font-semibold text-white mb-4">Team Members</h3>
          <table class="w-full text-left mb-4">
            <thead>
              <tr class="border-b border-gray-700">
                <th class="pb-3 text-gray-400 font-medium">Name</th>
                <th class="pb-3 text-gray-400 font-medium">Email</th>
                <th class="pb-3 text-gray-400 font-medium">Role</th>
                <th class="pb-3 text-gray-400 font-medium">Permissions</th>
                <th class="pb-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let emp of employees" class="border-b border-gray-800/50">
                <td class="py-2 text-white">{{ emp.name }}</td>
                <td class="py-2 text-xs text-white">{{ emp.email }}</td>
                <td class="py-2 text-white">{{ emp.role === 'enterprise_employer' ? 'Employer' : 'Employee' }}</td>
                <td class="py-2">
                  <div class="flex flex-wrap gap-1">
                    <label *ngFor="let perm of permissionKeys">
                      <input type="checkbox" [checked]="getPermission(emp, perm)" (change)="onPermissionChange(emp, perm, $event)" />
                      <span class="text-xs text-gray-300 ml-1">{{ getPermissionLabel(perm) }}</span>
                    </label>
                  </div>
                </td>
                <td class="py-2">
                  <button (click)="removeEmployee(emp.id)" class="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
          <form (ngSubmit)="addEmployee()" class="flex gap-2 items-end">
            <input [(ngModel)]="newEmployee.name" name="name" placeholder="Name" class="px-2 py-1 rounded bg-dark-surface/50 text-white border border-neon-purple/30" required />
            <input [(ngModel)]="newEmployee.email" name="email" placeholder="Email" class="px-2 py-1 rounded bg-dark-surface/50 text-white border border-neon-purple/30" required />
            <button type="submit" class="px-4 py-1 bg-neon-purple text-white rounded">Add</button>
          </form>
        </div>
        <div class="mb-8">
          <h3 class="text-xl font-semibold text-white mb-4">Company Diagrams</h3>
          <div *ngFor="let diag of diagrams" class="glass p-4 rounded-lg mb-4 border border-neon-purple/30">
            <div class="flex items-center justify-between mb-2">
              <div>
                <h4 class="font-semibold text-white">{{ diag.name }}</h4>
                <p class="text-xs text-gray-400">{{ diag.type }} • {{ diag.description }}</p>
              </div>
              <span class="text-xs text-gray-500">Last modified: {{ diag.last_modified | date:'short' }}</span>
            </div>
            <div class="flex flex-wrap gap-2 mt-2">
              <span class="text-xs text-gray-400">Share with:</span>
              <label *ngFor="let emp of employees">
                <input type="checkbox" [checked]="diag.permissions.canView.includes(emp.id)" (change)="onResourcePermissionChange(diag, 'canView', emp.id, $event, 'diagram')" />
                <span class="text-xs text-gray-300 ml-1">{{ emp.name }}</span>
              </label>
            </div>
          </div>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-white mb-4">Company Codebases</h3>
          <div *ngFor="let code of codebases" class="glass p-4 rounded-lg mb-4 border border-neon-purple/30">
            <div class="flex items-center justify-between mb-2">
              <div>
                <h4 class="font-semibold text-white">{{ code.name }}</h4>
                <p class="text-xs text-gray-400">{{ code.language }}/{{ code.framework }} • {{ code.description }}</p>
              </div>
              <span class="text-xs text-gray-500">Last modified: {{ code.last_modified | date:'short' }}</span>
            </div>
            <div class="flex flex-wrap gap-2 mt-2">
              <span class="text-xs text-gray-400">Share with:</span>
              <label *ngFor="let emp of employees">
                <input type="checkbox" [checked]="code.permissions.canView.includes(emp.id)" (change)="onResourcePermissionChange(code, 'canView', emp.id, $event, 'codebase')" />
                <span class="text-xs text-gray-300 ml-1">{{ emp.name }}</span>
              </label>
            </div>
          </div>
        </div>
      </ng-container>
      <ng-template #employeeView>
        <!-- EMPLOYEE VIEW -->
        <div class="mb-8">
          <h3 class="text-xl font-semibold text-white mb-4">Your Permissions</h3>
          <div class="flex flex-wrap gap-2">
            <ng-container *ngFor="let perm of permissionKeys">
              <span *ngIf="getCurrentUserPermission(perm)" class="px-2 py-1 bg-neon-purple/20 text-neon-purple rounded text-xs">
                {{ getPermissionLabel(perm) }}
              </span>
            </ng-container>
          </div>
        </div>
        <div class="mb-8">
          <h3 class="text-xl font-semibold text-white mb-4">Diagrams Shared With You</h3>
          <ng-container *ngFor="let diag of diagrams">
            <div *ngIf="diag.permissions.canView.includes(currentUser?.id || '')" class="glass p-4 rounded-lg mb-4 border border-neon-purple/30">
              <div class="flex items-center justify-between mb-2">
                <div>
                  <h4 class="font-semibold text-white">{{ diag.name }}</h4>
                  <p class="text-xs text-gray-400">{{ diag.type }} • {{ diag.description }}</p>
                </div>
                <span class="text-xs text-gray-500">Last modified: {{ diag.last_modified | date:'short' }}</span>
              </div>
            </div>
          </ng-container>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-white mb-4">Codebases Shared With You</h3>
          <ng-container *ngFor="let code of codebases">
            <div *ngIf="code.permissions.canView.includes(currentUser?.id || '')" class="glass p-4 rounded-lg mb-4 border border-neon-purple/30">
              <div class="flex items-center justify-between mb-2">
                <div>
                  <h4 class="font-semibold text-white">{{ code.name }}</h4>
                  <p class="text-xs text-gray-400">{{ code.language }}/{{ code.framework }} • {{ code.description }}</p>
                </div>
                <span class="text-xs text-gray-500">Last modified: {{ code.last_modified | date:'short' }}</span>
              </div>
            </div>
          </ng-container>
        </div>
      </ng-template>
    </div>
  `,
  styles: []
})
export class EnterpriseManagementComponent {
  employees: EnterpriseUser[] = [];
  diagrams: DiagramResource[] = [];
  codebases: CodebaseResource[] = [];
  currentUser: EnterpriseUser | null = null;
  isEmployer = false;
  permissionKeys: PermissionKey[] = [
    'canViewDiagrams',
    'canGenerateDiagrams',
    'canViewCodebases',
    'canUploadCodebases',
    'canViewSecurity',
    'canViewDevOps',
    'canViewQueryEngine',
    'canManageTeam'
  ];
  newEmployee = { name: '', email: '' };

  constructor(private enterpriseService: EnterpriseService) {
    this.refresh();
  }

  refresh() {
    this.currentUser = this.enterpriseService['authService'].getCurrentUser() as EnterpriseUser;
    this.isEmployer = this.enterpriseService.isEnterpriseEmployer();
    this.employees = this.enterpriseService.getCompanyEmployees();
    this.diagrams = this.enterpriseService.getCompanyDiagrams();
    this.codebases = this.enterpriseService.getCompanyCodebases();
  }

  getPermission(emp: EnterpriseUser, perm: string): boolean {
    return emp.permissions[perm as PermissionKey] || false;
  }

  getCurrentUserPermission(perm: string): boolean {
    return this.currentUser?.permissions[perm as PermissionKey] || false;
  }

  getPermissionLabel(perm: string): string {
    return perm.replace('can', '');
  }

  onPermissionChange(emp: EnterpriseUser, perm: string, event: Event) {
    const target = event.target as HTMLInputElement;
    this.togglePermission(emp, perm as PermissionKey, target.checked);
  }

  onResourcePermissionChange(resource: DiagramResource | CodebaseResource, permType: keyof ResourcePermissions, empId: string, event: Event, resourceType: 'diagram' | 'codebase') {
    const target = event.target as HTMLInputElement;
    this.toggleResourcePermission(resource, permType, empId, target.checked, resourceType);
  }

  addEmployee() {
    if (!this.newEmployee.name || !this.newEmployee.email) return;
    const id = 'emp_' + Math.floor(Math.random() * 1000000);
    const emp: EnterpriseUser = {
      id,
      email: this.newEmployee.email,
      password: id,
      name: this.newEmployee.name,
      role: 'enterprise_employee',
      company_id: this.currentUser!.company_id,
      position: 'Employee',
      department: 'Engineering',
      hire_date: new Date().toISOString().slice(0, 10),
      permissions: {
        canViewDiagrams: true,
        canGenerateDiagrams: false,
        canViewCodebases: true,
        canUploadCodebases: false,
        canViewSecurity: false,
        canViewDevOps: false,
        canViewQueryEngine: true,
        canManageTeam: false
      }
    };
    this.enterpriseService.addEmployee(emp);
    this.refresh();
    this.newEmployee = { name: '', email: '' };
  }

  removeEmployee(id: string) {
    this.enterpriseService.removeEmployee(id);
    this.refresh();
  }

  togglePermission(emp: EnterpriseUser, perm: PermissionKey, checked: boolean) {
    this.enterpriseService.updateEmployeePermissions(emp.id, { [perm]: checked });
    this.refresh();
  }

  toggleResourcePermission(resource: DiagramResource | CodebaseResource, permType: keyof ResourcePermissions, empId: string, checked: boolean, resourceType: 'diagram' | 'codebase') {
    const permissions = { ...resource.permissions };
    const arr = permissions[permType] as string[];
    if (checked && !arr.includes(empId)) arr.push(empId);
    if (!checked) permissions[permType] = arr.filter(id => id !== empId);
    if (resourceType === 'diagram') {
      this.enterpriseService.updateDiagramPermissions(resource.id, permissions);
    } else {
      this.enterpriseService.updateCodebasePermissions(resource.id, permissions);
    }
    this.refresh();
  }
} 