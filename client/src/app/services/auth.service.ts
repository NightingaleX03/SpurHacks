import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'enterprise_employer' | 'enterprise_employee' | 'education_user' | 'regular_user';
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  private users: User[] = [];
  private usersLoaded = false;

  constructor(private router: Router, private http: HttpClient) {
    // Check if user is already logged in (from localStorage)
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.isAuthenticatedSubject.next(true);
      const user = this.getUserFromToken(token);
      this.currentUserSubject.next(user);
    }
    // Load users from JSON
    this.loadUsers();
  }

  private loadUsers() {
    if (this.usersLoaded) return;
    console.log('Loading users from sample data...');
    this.http.get<any>('assets/data/sample-data.json').subscribe({
      next: (data) => {
        console.log('Sample data loaded:', data);
        this.users = [
          ...(data.enterprise_users || []),
          ...(data.regular_users || [])
        ];
        console.log('Users loaded:', this.users);
        this.usersLoaded = true;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    return new Promise((resolve) => {
      // Wait for users to be loaded
      if (!this.usersLoaded) {
        this.http.get<any>('assets/data/sample-data.json').subscribe(data => {
          this.users = [
            ...(data.enterprise_users || []),
            ...(data.regular_users || [])
          ];
          this.usersLoaded = true;
          this.doLogin(email, password, resolve);
        });
      } else {
        this.doLogin(email, password, resolve);
      }
    });
  }

  private doLogin(email: string, password: string, resolve: (result: { success: boolean; user?: User; error?: string }) => void) {
    console.log('Attempting login with:', { email, password });
    console.log('Available users:', this.users);
    
    // Check both email and password
    const user = this.users.find(u => u.email === email && u.password === password);
    console.log('Found user:', user);
    
    if (user) {
      const mockToken = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user', JSON.stringify(user));
      this.isAuthenticatedSubject.next(true);
      this.currentUserSubject.next(user);
      console.log('Login successful for:', user.name);
      resolve({ success: true, user });
    } else {
      console.log('Login failed - no matching user found');
      resolve({
        success: false,
        error: 'Invalid email or password. Use one of the sample accounts with their ID as password.'
      });
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getSampleUsers(): User[] {
    return this.users;
  }

  private getUserFromToken(token: string): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
} 