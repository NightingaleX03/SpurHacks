import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0">
        <div class="absolute top-20 left-10 w-32 h-32 bg-neon-purple rounded-full opacity-10 blur-xl animate-float"></div>
        <div class="absolute top-40 right-20 w-24 h-24 bg-electric-blue rounded-full opacity-10 blur-xl animate-float" style="animation-delay: 2s;"></div>
        <div class="absolute bottom-20 left-1/4 w-40 h-40 bg-highlight rounded-full opacity-5 blur-xl animate-float" style="animation-delay: 4s;"></div>
      </div>

      <!-- Login Form -->
      <div class="glass p-8 md:p-12 rounded-2xl w-full max-w-md relative z-10">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-r from-neon-purple to-electric-blue rounded-xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white font-bold text-2xl">S</span>
          </div>
          <h1 class="text-3xl font-bold text-white neon-glow text-neon-purple mb-2">Welcome Back</h1>
          <p class="text-gray-400">Sign in to your StackSketch account</p>
        </div>

        <!-- Demo Users Info -->
        <div class="mb-6 p-4 bg-gradient-to-r from-neon-purple/20 to-electric-blue/20 rounded-lg border border-neon-purple/30">
          <h3 class="text-sm font-semibold text-highlight mb-2">Demo Accounts:</h3>
          <div class="text-xs text-gray-400 space-y-1">
            <div>• enterprise_employer&#64;demo.com</div>
            <div>• enterprise_employee&#64;demo.com</div>
            <div>• education_user&#64;demo.com</div>
            <div class="text-highlight mt-1">Password: password123</div>
          </div>
        </div>

        <!-- Login Form -->
        <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="space-y-6">
          <!-- Email Field -->
          <div class="relative">
            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <div class="relative">
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="email"
                required
                class="w-full px-4 py-3 bg-dark-surface/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20 transition-all duration-300"
                placeholder="Enter your email"
                [class.animate-shake]="showError"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Password Field -->
          <div class="relative">
            <label for="password" class="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div class="relative">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                class="w-full px-4 py-3 bg-dark-surface/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20 transition-all duration-300"
                placeholder="Enter your password"
                [class.animate-shake]="showError"
              />
              <button
                type="button"
                (click)="togglePassword()"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors"
              >
                <svg *ngIf="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <svg *ngIf="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p class="text-red-400 text-sm">{{ errorMessage }}</p>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            [disabled]="isLoading"
            class="neon-button w-full py-3 bg-gradient-to-r from-neon-purple to-electric-blue text-white font-semibold rounded-lg border border-neon-purple hover:border-highlight transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div *ngIf="isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </div>
            <span *ngIf="!isLoading">Log In</span>
          </button>
        </form>

        <!-- Quick Login Buttons -->
        <div class="mt-6 space-y-3">
          <p class="text-center text-sm text-gray-400">Quick login with demo accounts:</p>
          <div class="grid grid-cols-1 gap-2">
            <button
              (click)="quickLogin('enterprise_employer@demo.com')"
              class="text-left p-3 bg-dark-surface/30 border border-gray-600 rounded-lg hover:border-neon-purple transition-colors duration-300"
            >
              <div class="text-sm font-medium text-white">Enterprise Employer</div>
              <div class="text-xs text-gray-400">enterprise_employer&#64;demo.com</div>
            </button>
            <button
              (click)="quickLogin('enterprise_employee@demo.com')"
              class="text-left p-3 bg-dark-surface/30 border border-gray-600 rounded-lg hover:border-neon-purple transition-colors duration-300"
            >
              <div class="text-sm font-medium text-white">Enterprise Employee</div>
              <div class="text-xs text-gray-400">enterprise_employee&#64;demo.com</div>
            </button>
            <button
              (click)="quickLogin('education_user@demo.com')"
              class="text-left p-3 bg-dark-surface/30 border border-gray-600 rounded-lg hover:border-neon-purple transition-colors duration-300"
            >
              <div class="text-sm font-medium text-white">Education User</div>
              <div class="text-xs text-gray-400">education_user&#64;demo.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `]
})
export class LoginComponent implements OnInit, AfterViewInit {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  errorMessage: string = '';
  showError: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Component initialization
  }

  ngAfterViewInit() {
    // GSAP animations
    gsap.from('.glass', {
      duration: 1,
      scale: 0.9,
      opacity: 0,
      ease: 'back.out(1.7)'
    });

    gsap.from('input', {
      duration: 0.8,
      y: 20,
      opacity: 0,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.3
    });

    gsap.from('.neon-button', {
      duration: 0.8,
      y: 20,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.6
    });
  }

  async onLogin() {
    if (!this.email || !this.password) {
      this.showErrorMessage('Please enter both email and password');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.showError = false;

    try {
      const result = await this.authService.login(this.email, this.password);
      
      if (result.success && result.user) {
        // Redirect to dashboard based on role
        this.router.navigate(['/dashboard']);
      } else {
        this.showErrorMessage(result.error || 'Login failed');
      }
    } catch (error) {
      this.showErrorMessage('An error occurred during login');
    } finally {
      this.isLoading = false;
    }
  }

  quickLogin(email: string) {
    this.email = email;
    this.password = 'password123';
    this.onLogin();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  private showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showError = true;
    
    // Remove error after 5 seconds
    setTimeout(() => {
      this.showError = false;
    }, 5000);
  }
} 