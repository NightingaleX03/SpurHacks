import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav *ngIf="!isAuthenticated" class="bg-black fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <!-- Logo -->
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-gradient-to-r from-neon-purple to-electric-blue rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">S</span>
          </div>
          <span class="text-xl font-bold text-white" style="text-shadow: 0 0 2px rgba(142, 45, 226, 0.4);">StackSketch</span>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">Home</a>
          <a routerLink="/about" routerLinkActive="active" class="nav-link">About</a>
          <a *ngIf="!isAuthenticated && router.url !== '/login'" routerLink="/login" class="neon-button px-6 py-2">Login</a>
        </div>

        <!-- Mobile Menu Button -->
        <button (click)="toggleMobileMenu()" class="md:hidden text-gray-300 hover:text-highlight">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div *ngIf="mobileMenuOpen" class="md:hidden mt-4">
        <div class="flex flex-col items-center space-y-4 pt-4 border-t border-white/20">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link" (click)="closeMobileMenu()">Home</a>
          <a routerLink="/about" routerLinkActive="active" class="nav-link" (click)="closeMobileMenu()">About</a>
          <a *ngIf="!isAuthenticated && router.url !== '/login'" routerLink="/login" class="neon-button w-full text-center py-3" (click)="closeMobileMenu()">Login</a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-link {
      @apply text-gray-300 hover:text-highlight transition-all duration-300 font-medium relative;
    }
    .nav-link.active {
      @apply text-highlight;
      text-shadow: 0 0 3px var(--highlight);
    }
    .neon-button {
      @apply bg-gradient-to-r from-neon-purple to-electric-blue text-white font-semibold rounded-lg border border-neon-purple hover:border-highlight transition-all duration-300;
    }
  `]
})
export class NavbarComponent implements OnInit {
  mobileMenuOpen = false;
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit() {
    console.log('NavbarComponent: Initializing...');
    this.authService.isAuthenticated$.subscribe((isAuth: boolean) => {
      console.log('NavbarComponent: Authentication state changed:', isAuth);
      this.isAuthenticated = isAuth;
    });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
} 