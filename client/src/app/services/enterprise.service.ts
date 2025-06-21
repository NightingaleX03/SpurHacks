import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService, User } from './auth.service';

export interface Employee {
  id: string;
  email: string;
  name: string;
  role: 'enterprise_employee';
  employerId: string;
  permissions: EmployeePermissions;
  createdAt: Date;
  lastActive: Date;
}

export interface EmployeePermissions {
  canViewDiagrams: boolean;
  canGenerateDiagrams: boolean;
  canViewCodebases: boolean;
  canUploadCodebases: boolean;
  canViewSecurity: boolean;
  canViewDevOps: boolean;
  canViewQueryEngine: boolean;
  canManageTeam: boolean;
}

export interface EnterpriseOrganization {
  id: string;
  name: string;
  employerId: string;
  employees: Employee[];
  sharedDiagrams: SharedDiagram[];
  sharedCodebases: SharedCodebase[];
  createdAt: Date;
}

export interface SharedDiagram {
  id: string;
  name: string;
  type: string;
  createdBy: string;
  sharedWith: string[];
  createdAt: Date;
  lastModified: Date;
}

export interface SharedCodebase {
  id: string;
  name: string;
  description: string;
  uploadedBy: string;
  sharedWith: string[];
  createdAt: Date;
  lastModified: Date;
}

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {
  private currentOrganizationSubject = new BehaviorSubject<EnterpriseOrganization | null>(null);
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  private sharedDiagramsSubject = new BehaviorSubject<SharedDiagram[]>([]);
  private sharedCodebasesSubject = new BehaviorSubject<SharedCodebase[]>([]);

  public currentOrganization$ = this.currentOrganizationSubject.asObservable();
  public employees$ = this.employeesSubject.asObservable();
  public sharedDiagrams$ = this.sharedDiagramsSubject.asObservable();
  public sharedCodebases$ = this.sharedCodebasesSubject.asObservable();

  // Mock data for demo purposes
  private mockOrganization: EnterpriseOrganization = {
    id: 'org_1',
    name: 'TechCorp Solutions',
    employerId: 'enterprise_employer@demo.com',
    employees: [
      {
        id: 'emp_1',
        email: 'enterprise_employee@demo.com',
        name: 'Enterprise Employee',
        role: 'enterprise_employee',
        employerId: 'enterprise_employer@demo.com',
        permissions: {
          canViewDiagrams: true,
          canGenerateDiagrams: true,
          canViewCodebases: true,
          canUploadCodebases: false,
          canViewSecurity: false,
          canViewDevOps: false,
          canViewQueryEngine: true,
          canManageTeam: false
        },
        createdAt: new Date('2024-01-15'),
        lastActive: new Date()
      }
    ],
    sharedDiagrams: [
      {
        id: 'diag_1',
        name: 'User Authentication Flow',
        type: 'Sequence Diagram',
        createdBy: 'enterprise_employer@demo.com',
        sharedWith: ['enterprise_employee@demo.com'],
        createdAt: new Date('2024-01-20'),
        lastModified: new Date('2024-01-25')
      },
      {
        id: 'diag_2',
        name: 'Microservices Architecture',
        type: 'Component Diagram',
        createdBy: 'enterprise_employer@demo.com',
        sharedWith: ['enterprise_employee@demo.com'],
        createdAt: new Date('2024-01-18'),
        lastModified: new Date('2024-01-22')
      }
    ],
    sharedCodebases: [
      {
        id: 'code_1',
        name: 'Frontend React App',
        description: 'Main customer-facing application',
        uploadedBy: 'enterprise_employer@demo.com',
        sharedWith: ['enterprise_employee@demo.com'],
        createdAt: new Date('2024-01-10'),
        lastModified: new Date('2024-01-28')
      }
    ],
    createdAt: new Date('2024-01-01')
  };

  constructor(private authService: AuthService) {
    this.initializeOrganization();
  }

  private initializeOrganization() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.role === 'enterprise_employer') {
      this.currentOrganizationSubject.next(this.mockOrganization);
      this.employeesSubject.next(this.mockOrganization.employees);
      this.sharedDiagramsSubject.next(this.mockOrganization.sharedDiagrams);
      this.sharedCodebasesSubject.next(this.mockOrganization.sharedCodebases);
    }
  }

  // Employer methods
  getEmployees(): Observable<Employee[]> {
    return this.employees$;
  }

  updateEmployeePermissions(employeeId: string, permissions: Partial<EmployeePermissions>): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const employees = this.employeesSubject.value;
        const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
        
        if (employeeIndex !== -1) {
          employees[employeeIndex] = {
            ...employees[employeeIndex],
            permissions: { ...employees[employeeIndex].permissions, ...permissions }
          };
          this.employeesSubject.next([...employees]);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  }

  addEmployee(email: string, name: string, permissions: EmployeePermissions): Promise<Employee> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newEmployee: Employee = {
          id: `emp_${Date.now()}`,
          email,
          name,
          role: 'enterprise_employee',
          employerId: this.authService.getCurrentUser()?.email || '',
          permissions,
          createdAt: new Date(),
          lastActive: new Date()
        };

        const employees = this.employeesSubject.value;
        this.employeesSubject.next([...employees, newEmployee]);
        resolve(newEmployee);
      }, 500);
    });
  }

  removeEmployee(employeeId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const employees = this.employeesSubject.value;
        const filteredEmployees = employees.filter(emp => emp.id !== employeeId);
        this.employeesSubject.next(filteredEmployees);
        resolve(true);
      }, 500);
    });
  }

  shareDiagram(diagramId: string, employeeIds: string[]): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const diagrams = this.sharedDiagramsSubject.value;
        const diagramIndex = diagrams.findIndex(diag => diag.id === diagramId);
        
        if (diagramIndex !== -1) {
          diagrams[diagramIndex] = {
            ...diagrams[diagramIndex],
            sharedWith: employeeIds
          };
          this.sharedDiagramsSubject.next([...diagrams]);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  }

  shareCodebase(codebaseId: string, employeeIds: string[]): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const codebases = this.sharedCodebasesSubject.value;
        const codebaseIndex = codebases.findIndex(code => code.id === codebaseId);
        
        if (codebaseIndex !== -1) {
          codebases[codebaseIndex] = {
            ...codebases[codebaseIndex],
            sharedWith: employeeIds
          };
          this.sharedCodebasesSubject.next([...codebases]);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  }

  // Employee methods
  getEmployeePermissions(): EmployeePermissions | null {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.role === 'enterprise_employee') {
      const employees = this.employeesSubject.value;
      const employee = employees.find(emp => emp.email === currentUser.email);
      return employee?.permissions || null;
    }
    return null;
  }

  getSharedDiagrams(): Observable<SharedDiagram[]> {
    return this.sharedDiagrams$;
  }

  getSharedCodebases(): Observable<SharedCodebase[]> {
    return this.sharedCodebases$;
  }

  canAccessFeature(feature: keyof EmployeePermissions): boolean {
    const permissions = this.getEmployeePermissions();
    return permissions ? permissions[feature] : false;
  }

  // Utility methods
  isEmployer(): boolean {
    return this.authService.getCurrentUser()?.role === 'enterprise_employer';
  }

  isEmployee(): boolean {
    return this.authService.getCurrentUser()?.role === 'enterprise_employee';
  }

  getCurrentOrganization(): EnterpriseOrganization | null {
    return this.currentOrganizationSubject.value;
  }
} 