import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import mockData from '../../assets/data/sample-data.json';
import { AuthService, User } from './auth.service';
import { environment } from '../../environments/environment';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path?: string;
  content?: string;
  children?: FileNode[];
  expanded?: boolean;
}

export interface SavedCodebase {
  id: string;
  owner: string;
  repo: string;
  file_tree: FileNode[];
  tech_stack: string[];
  repo_info: any;
  total_files: number;
  savedAt: Date;
}

export interface SharedCodebase {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  owner_email: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  tech_stack: string[];
  total_files: number;
  total_size: number;
}

export interface CodebasePermission {
  id: string;
  codebase_id: string;
  user_id: string;
  user_email: string;
  permission: 'read' | 'write' | 'admin';
  granted_by: string;
  granted_at: string;
  expires_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CodebaseService {
  private userCodebases: { [userId: string]: SavedCodebase[] } = (mockData as any).user_codebases || {};
  private savedCodebasesSubject = new BehaviorSubject<SavedCodebase[]>([]);
  private sharedCodebasesSubject = new BehaviorSubject<SharedCodebase[]>([]);
  
  public savedCodebases$ = this.savedCodebasesSubject.asObservable();
  public sharedCodebases$ = this.sharedCodebasesSubject.asObservable();

  private currentUser: any;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
      if (user) {
        this.loadUserCodebases(user.id);
      } else {
        this.savedCodebasesSubject.next([]);
      }
    });
    this.loadSavedCodebases();
    this.loadSharedCodebases();
  }

  private loadUserCodebases(userId: number) {
    const userBases = this.userCodebases[userId.toString()] || [];
    this.savedCodebasesSubject.next(userBases);
  }

  private loadSavedCodebases() {
    const saved = localStorage.getItem('savedCodebases');
    if (saved) {
      this.savedCodebasesSubject.next(JSON.parse(saved));
    }
  }

  private loadSharedCodebases() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.email) {
      this.http.get<{codebases: SharedCodebase[]}>(`${environment.apiUrl}/codebases/my-codebases?user_email=${currentUser.email}`)
        .subscribe({
          next: (response) => {
            console.log('Loaded shared codebases:', response.codebases);
            this.sharedCodebasesSubject.next(response.codebases);
          },
          error: (error) => {
            console.error('Error loading shared codebases:', error);
            // Initialize with empty array on error
            this.sharedCodebasesSubject.next([]);
          }
        });
    } else {
      console.log('No authenticated user found, initializing empty shared codebases');
      this.sharedCodebasesSubject.next([]);
    }
  }

  saveCodebase(codebaseData: Omit<SavedCodebase, 'id' | 'savedAt'>): void {
    if (!this.currentUser) return;

    const newCodebase: SavedCodebase = {
      ...codebaseData,
      id: new Date().getTime().toString(),
      savedAt: new Date(),
    };

    const userId = this.currentUser.id.toString();
    if (!this.userCodebases[userId]) {
      this.userCodebases[userId] = [];
    }
    this.userCodebases[userId].push(newCodebase);
    this.loadUserCodebases(this.currentUser.id);
    console.log('Updated user codebases:', this.userCodebases);
  }

  deleteCodebase(codebaseId: string): void {
    if (!this.currentUser) return;
    const userId = this.currentUser.id.toString();
    if (this.userCodebases[userId]) {
      this.userCodebases[userId] = this.userCodebases[userId].filter(cb => cb.id !== codebaseId);
      this.loadUserCodebases(this.currentUser.id);
    }
  }

  shareCodebase(codebase: any, name: string, description?: string, isPublic: boolean = false): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.email) {
      throw new Error('User not authenticated');
    }

    return this.http.post(`${environment.apiUrl}/codebases/share`, {
      name: name,
      description: description,
      is_public: isPublic,
      user_email: currentUser.email,
      company_id: currentUser['companyId'] || 'default-company',
      codebase_data: codebase
    });
  }

  grantPermission(codebaseId: string, granteeEmail: string, permission: 'read' | 'write' | 'admin', expiresAt?: Date): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.email) {
      throw new Error('User not authenticated');
    }

    return this.http.post(`${environment.apiUrl}/codebases/grant-permission`, {
      codebase_id: codebaseId,
      grantor_email: currentUser.email,
      grantee_email: granteeEmail,
      permission: permission,
      expires_at: expiresAt
    });
  }

  getCodebasePermissions(codebaseId: string): Observable<{permissions: CodebasePermission[]}> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.email) {
      throw new Error('User not authenticated');
    }

    return this.http.get<{permissions: CodebasePermission[]}>(`${environment.apiUrl}/codebases/${codebaseId}/permissions?user_email=${currentUser.email}`);
  }

  refreshSharedCodebases(): void {
    this.loadSharedCodebases();
  }

  getCodebaseData(codebaseId: string): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.email) {
      throw new Error('User not authenticated');
    }

    return this.http.get(`${environment.apiUrl}/codebases/${codebaseId}/data?user_email=${currentUser.email}`);
  }
} 