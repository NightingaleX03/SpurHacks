import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService, Theme } from '../services/theme.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <!-- Logo -->
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-gradient-to-r from-neon-purple to-electric-blue rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">S</span>
          </div>
          <span class="text-xl font-bold text-white" style="text-shadow: 0 0 8px rgba(142, 45, 226, 0.8);">StackSketch</span>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">Home</a>
          <a routerLink="/about" routerLinkActive="active" class="nav-link">About</a>
          <a *ngIf="!isAuthenticated && router.url !== '/login'" routerLink="/login" class="neon-button px-6 py-2">Login</a>
          <a *ngIf="isAuthenticated" routerLink="/dashboard" class="neon-button px-6 py-2">Dashboard</a>
          <button (click)="toggleTheme()" class="p-2 rounded-full text-white hover:bg-white/10 transition-colors">
            <svg *ngIf="currentTheme === 'light'" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
            <svg *ngIf="currentTheme === 'dark'" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path></svg>
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <button (click)="toggleMobileMenu()" class="md:hidden text-white hover:text-highlight">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div *ngIf="mobileMenuOpen" class="md:hidden mt-4">
        <div class="flex flex-col items-center space-y-4 pt-4 border-t border-white/20">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link" (click)="closeMobileMenu()">Home</a>
          <a routerLink="/about" routerLinkActive="active" class="nav-link" (click)="closeMobileMenu()">About</a>
          <a *ngIf="!isAuthenticated && router.url !== '/login'" routerLink="/login" class="neon-button w-full text-center py-3" (click)="closeMobileMenu()">Login</a>
          <a *ngIf="isAuthenticated" routerLink="/dashboard" class="neon-button w-full text-center py-3" (click)="closeMobileMenu()">Dashboard</a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-link {
      @apply text-white hover:text-highlight transition-all duration-300 font-medium relative;
    }
    .nav-link.active {
      @apply text-highlight;
      text-shadow: 0 0 8px var(--highlight);
    }
    .neon-button {
      @apply bg-gradient-to-r from-neon-purple to-electric-blue text-white font-semibold rounded-lg border border-neon-purple hover:border-highlight transition-all duration-300;
    }
  `]
})
export class NavbarComponent implements OnInit {
  mobileMenuOpen = false;
  currentTheme: Theme = 'dark';
  isAuthenticated = false;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit() {
    this.themeService.theme$.subscribe((theme: Theme) => {
      this.currentTheme = theme;
    });

    this.authService.isAuthenticated$.subscribe((isAuth: boolean) => {
      this.isAuthenticated = isAuth;
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
} 