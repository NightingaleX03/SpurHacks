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
    console.log('AuthService: Constructor called');
    
    // Check if user is already logged in (from localStorage)
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    
    console.log('AuthService: localStorage check - token:', !!token, 'userStr:', !!userStr);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Validate that we have a proper user object
        if (user && user.id && user.email && user.name) {
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(user);
          console.log('AuthService: User restored from localStorage:', user.name);
        } else {
          // Invalid user data, clear everything
          console.log('AuthService: Invalid user data, clearing auth');
          this.clearAuthData();
        }
      } catch (error) {
        console.error('AuthService: Error parsing user data from localStorage:', error);
        this.clearAuthData();
      }
    } else {
      // No token or user data, ensure we're not authenticated
      console.log('AuthService: No auth data found, setting not authenticated');
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
    }
    
    // Load users from JSON
    this.loadUsers();
  }

  private loadUsers() {
    if (this.usersLoaded) return;
    console.log('Loading users from sample data...');
    
    // Add a timeout to prevent hanging if the request takes too long
    const timeout = setTimeout(() => {
      console.warn('AuthService: Sample data loading timed out, using fallback');
      this.users = [];
      this.usersLoaded = true;
    }, 5000); // 5 second timeout
    
    this.http.get<any>('assets/data/sample-data.json').subscribe({
      next: (data) => {
        clearTimeout(timeout);
        console.log('Sample data loaded:', data);
        this.users = [
          ...(data.enterprise_users || []),
          ...(data.regular_users || [])
        ];
        console.log('Users loaded:', this.users);
        this.usersLoaded = true;
      },
      error: (error) => {
        clearTimeout(timeout);
        console.error('Error loading users:', error);
        // Set default users if loading fails
        this.users = [];
        this.usersLoaded = true;
        console.log('AuthService: Using empty users array due to loading error');
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
    this.clearAuthData();
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

  private clearAuthData() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    console.log('AuthService: Authentication data cleared');
  }

  // Method to force reset authentication state (useful for debugging)
  forceResetAuth() {
    console.log('AuthService: Force resetting authentication state');
    this.clearAuthData();
  }

  // Method to check current authentication state
  getAuthState() {
    const isAuth = this.isAuthenticatedSubject.value;
    const user = this.currentUserSubject.value;
    console.log('AuthService: Current state - isAuthenticated:', isAuth, 'user:', user);
    return { isAuthenticated: isAuth, user };
  }
} 