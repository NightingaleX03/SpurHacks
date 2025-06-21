import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'enterprise_employer' | 'enterprise_employee' | 'education_user';
}

export interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: User['role'];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  // Hardcoded demo users
  private readonly demoUsers: DemoUser[] = [
    {
      email: 'enterprise_employer@demo.com',
      password: 'password123',
      name: 'Enterprise Employer',
      role: 'enterprise_employer'
    },
    {
      email: 'enterprise_employee@demo.com',
      password: 'password123',
      name: 'Enterprise Employee',
      role: 'enterprise_employee'
    },
    {
      email: 'education_user@demo.com',
      password: 'password123',
      name: 'Education User',
      role: 'education_user'
    }
  ];

  constructor(private router: Router) {
    // Check if user is already logged in (from localStorage)
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.isAuthenticatedSubject.next(true);
      const user = this.getUserFromToken(token);
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    return new Promise((resolve) => {
      // Mock authentication delay
      setTimeout(() => {
        const demoUser = this.demoUsers.find(user => 
          user.email === email && user.password === password
        );

        if (demoUser) {
          const user: User = {
            id: '1',
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role
          };
          
          const mockToken = 'mock_jwt_token_' + Date.now();
          localStorage.setItem('auth_token', mockToken);
          localStorage.setItem('user', JSON.stringify(user));
          
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(user);
          
          resolve({ success: true, user });
        } else {
          resolve({ 
            success: false, 
            error: 'Invalid email or password. Use one of the demo accounts.' 
          });
        }
      }, 1000); // Simulate network delay
    });
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

  getDemoUsers(): DemoUser[] {
    return this.demoUsers;
  }

  private getUserFromToken(token: string): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
} 