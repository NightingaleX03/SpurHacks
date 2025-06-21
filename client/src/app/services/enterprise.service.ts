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

export interface SharedDiagram {
  id: string;
  name: string;
  type: string;
  created_by: string;
  company_id: string;
  shared_with: string[];
  created_at: string;
  last_modified: string;
  description: string;
}

export interface SharedCodebase {
  id: string;
  name: string;
  description: string;
  uploaded_by: string;
  company_id: string;
  shared_with: string[];
  created_at: string;
  last_modified: string;
  language: string;
  framework: string;
  size: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {
  private companies: Company[] = [];
  private enterpriseUsers: EnterpriseUser[] = [];
  private sharedDiagrams: SharedDiagram[] = [];
  private sharedCodebases: SharedCodebase[] = [];
  private dataLoaded = false;

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
      this.sharedDiagrams = data.shared_diagrams || [];
      this.sharedCodebases = data.shared_codebases || [];
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

  // Check if user can access a specific feature
  canAccessFeature(feature: string): boolean {
    const user = this.authService.getCurrentUser() as EnterpriseUser;
    if (!user || !user.permissions) return false;
    return user.permissions[feature as keyof typeof user.permissions] || false;
  }

  // Get shared diagrams for current user's company
  getSharedDiagrams(): SharedDiagram[] {
    const company = this.getCurrentUserCompany();
    if (!company) return [];
    return this.sharedDiagrams.filter(d => d.company_id === company.id);
  }

  // Get shared codebases for current user's company
  getSharedCodebases(): SharedCodebase[] {
    const company = this.getCurrentUserCompany();
    if (!company) return [];
    return this.sharedCodebases.filter(c => c.company_id === company.id);
  }

  // Get user's accessible diagrams (based on permissions and sharing)
  getUserAccessibleDiagrams(): SharedDiagram[] {
    const user = this.authService.getCurrentUser() as EnterpriseUser;
    if (!user || !this.canAccessFeature('canViewDiagrams')) return [];
    
    const companyDiagrams = this.getSharedDiagrams();
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
  getUserAccessibleCodebases(): SharedCodebase[] {
    const user = this.authService.getCurrentUser() as EnterpriseUser;
    if (!user || !this.canAccessFeature('canViewCodebases')) return [];
    
    const companyCodebases = this.getSharedCodebases();
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
} 