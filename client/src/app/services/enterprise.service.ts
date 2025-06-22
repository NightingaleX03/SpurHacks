import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService, User } from './auth.service';
import { HttpClient } from '@angular/common/http';

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  founded: string;
  location: string;
  website: string;
}

export interface EnterpriseUser extends User {
  company_id: string;
  position: string;
  department: string;
  hire_date: string;
  permissions: {
    canViewDiagrams: boolean;
    canGenerateDiagrams: boolean;
    canViewCodebases: boolean;
    canUploadCodebases: boolean;
    canViewSecurity: boolean;
    canViewDevOps: boolean;
    canViewQueryEngine: boolean;
    canManageTeam: boolean;
  };
}

export interface ResourcePermissions {
  canView: string[];
  canEdit: string[];
  canShare: string[];
}

export interface DiagramResource {
  id: string;
  name: string;
  type: string;
  description: string;
  company_id: string;
  created_by: string;
  created_at: string;
  last_modified: string;
  access_level: string;
  shared_with: string[];
  mermaid_code: string;
  permissions: ResourcePermissions;
}

export interface CodebaseResource {
  id: string;
  name: string;
  description: string;
  language: string;
  framework: string;
  size: string;
  uploaded_by: string;
  created_at: string;
  last_modified: string;
  access_level: string;
  shared_with: string[];
  permissions: ResourcePermissions;
}

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {
  private companies: Company[] = [];
  private enterpriseUsers: EnterpriseUser[] = [];
  private dataLoaded = false;

  private diagrams: { [companyId: string]: DiagramResource[] } = {};
  private codebases: { [companyId: string]: CodebaseResource[] } = {};

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.loadEnterpriseData();
  }

  private loadEnterpriseData() {
    if (this.dataLoaded) return;
    
    this.http.get<any>('assets/data/sample-data.json').subscribe(data => {
      this.companies = data.companies || [];
      this.enterpriseUsers = data.enterprise_users || [];
    });
    this.http.get<any>('assets/data/enterprise-resources.json').subscribe(data => {
      this.diagrams = data.company_diagrams || {};
      this.codebases = data.company_codebases || {};
      this.dataLoaded = true;
    });
  }

  // Check if current user is an enterprise user
  isEnterpriseUser(): boolean {
    const user = this.authService.getCurrentUser();
    return user ? ['enterprise_employer', 'enterprise_employee'].includes(user.role) : false;
  }

  // Check if current user is an enterprise employer
  isEnterpriseEmployer(): boolean {
    const user = this.authService.getCurrentUser();
    return user ? user.role === 'enterprise_employer' : false;
  }

  // Check if current user is an enterprise employee
  isEmployee(): boolean {
    const user = this.authService.getCurrentUser();
    return user ? user.role === 'enterprise_employee' : false;
  }

  // Get current user's company
  getCurrentUserCompany(): Company | null {
    const user = this.authService.getCurrentUser() as EnterpriseUser;
    if (!user || !user.company_id) return null;
    return this.companies.find(c => c.id === user.company_id) || null;
  }

  // Get all employees in current user's company
  getCompanyEmployees(): EnterpriseUser[] {
    const company = this.getCurrentUserCompany();
    if (!company) return [];
    return this.enterpriseUsers.filter(u => u.company_id === company.id);
  }

  getCompanyEmployer(companyId: string): EnterpriseUser | undefined {
    return this.enterpriseUsers.find(u => u.company_id === companyId && u.role === 'enterprise_employer');
  }

  // Check if user can access a specific feature
  canAccessFeature(feature: string): boolean {
    const user = this.authService.getCurrentUser() as EnterpriseUser;
    if (!user || !user.permissions) return false;
    return user.permissions[feature as keyof typeof user.permissions] || false;
  }

  // Get company diagrams
  getCompanyDiagrams(): DiagramResource[] {
    const company = this.getCurrentUserCompany();
    if (!company) return [];
    return this.diagrams[company.id] || [];
  }

  // Get company codebases
  getCompanyCodebases(): CodebaseResource[] {
    const company = this.getCurrentUserCompany();
    if (!company) return [];
    return this.codebases[company.id] || [];
  }

  // Get user's accessible diagrams (based on permissions and sharing)
  getUserAccessibleDiagrams(): DiagramResource[] {
    const user = this.authService.getCurrentUser() as EnterpriseUser;
    if (!user || !this.canAccessFeature('canViewDiagrams')) return [];
    
    const companyDiagrams = this.getCompanyDiagrams();
    if (this.isEnterpriseEmployer()) {
      return companyDiagrams; // Employers can see all company diagrams
    } else {
      // Employees can only see diagrams shared with them
      return companyDiagrams.filter(d => 
        d.shared_with.includes(user.id) || d.created_by === user.id
      );
    }
  }

  // Get user's accessible codebases (based on permissions and sharing)
  getUserAccessibleCodebases(): CodebaseResource[] {
    const user = this.authService.getCurrentUser() as EnterpriseUser;
    if (!user || !this.canAccessFeature('canViewCodebases')) return [];
    
    const companyCodebases = this.getCompanyCodebases();
    if (this.isEnterpriseEmployer()) {
      return companyCodebases; // Employers can see all company codebases
    } else {
      // Employees can only see codebases shared with them
      return companyCodebases.filter(c => 
        c.shared_with.includes(user.id) || c.uploaded_by === user.id
      );
    }
  }

  // Check if user can upload codebases
  canUploadCodebases(): boolean {
    return this.canAccessFeature('canUploadCodebases');
  }

  // Check if user can generate diagrams
  canGenerateDiagrams(): boolean {
    return this.canAccessFeature('canGenerateDiagrams');
  }

  // Check if user can view security features
  canViewSecurity(): boolean {
    return this.canAccessFeature('canViewSecurity');
  }

  // Check if user can view DevOps features
  canViewDevOps(): boolean {
    return this.canAccessFeature('canViewDevOps');
  }

  // Check if user can view query engine
  canViewQueryEngine(): boolean {
    return this.canAccessFeature('canViewQueryEngine');
  }

  // Check if user can manage team
  canManageTeam(): boolean {
    return this.canAccessFeature('canManageTeam');
  }

  // Get all companies (for demo purposes)
  getAllCompanies(): Company[] {
    return this.companies;
  }

  // Get all enterprise users (for demo purposes)
  getAllEnterpriseUsers(): EnterpriseUser[] {
    return this.enterpriseUsers;
  }

  // Add a new employee
  addEmployee(employee: EnterpriseUser) {
    this.enterpriseUsers.push(employee);
  }

  // Remove an employee
  removeEmployee(employeeId: string) {
    this.enterpriseUsers = this.enterpriseUsers.filter(e => e.id !== employeeId);
  }

  // Update employee permissions
  updateEmployeePermissions(employeeId: string, permissions: Partial<EnterpriseUser['permissions']>) {
    const emp = this.enterpriseUsers.find(e => e.id === employeeId);
    if (emp) {
      emp.permissions = { ...emp.permissions, ...permissions };
    }
  }

  // Update diagram permissions
  updateDiagramPermissions(diagramId: string, permissions: ResourcePermissions) {
    const company = this.getCurrentUserCompany();
    if (!company) return;
    const diagram = (this.diagrams[company.id] || []).find(d => d.id === diagramId);
    if (diagram) {
      diagram.permissions = permissions;
    }
  }

  // Update codebase permissions
  updateCodebasePermissions(codebaseId: string, permissions: ResourcePermissions) {
    const companyId = this.authService.getCurrentUser()?.['company_id'];
    if (companyId && this.codebases[companyId]) {
      const codebase = this.codebases[companyId].find(c => c.id === codebaseId);
      if (codebase) {
        codebase.permissions = permissions;
      }
    }
  }

  addDiagram(diagram: DiagramResource) {
    const companyId = this.authService.getCurrentUser()?.['company_id'];
    if (companyId) {
      if (!this.diagrams[companyId]) {
        this.diagrams[companyId] = [];
      }
      this.diagrams[companyId].push(diagram);
    }
  }
} 