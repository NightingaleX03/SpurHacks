import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService, User } from '../../services/auth.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <!-- Sidebar -->
      <aside class="glass-dark dark:glass w-20 md:w-64 flex flex-col items-center md:items-stretch py-8 px-2 md:px-4 space-y-8 md:space-y-0 md:space-x-0 shadow-xl relative z-20 sidebar">
        <div class="flex flex-col items-center md:items-start space-y-8 w-full">
          <!-- Logo -->
          <div class="flex items-center space-x-2 mb-8 md:mb-12">
            <div class="w-10 h-10 bg-gradient-to-r from-neon-purple to-electric-blue rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-2xl">S</span>
            </div>
            <span class="hidden md:inline text-2xl font-bold text-white text-neon-purple" style="text-shadow: 0 0 5px #8E2DE2, 0 0 10px #8E2DE2;">StackSketch</span>
          </div>

          <!-- Navigation -->
          <nav class="flex flex-col space-y-2 w-full">
            <a routerLink="overview" routerLinkActive="active" class="sidebar-link">
              <span class="sidebar-icon"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6"></path></svg></span>
              <span class="hidden md:inline ml-3">Overview</span>
            </a>
            <a routerLink="diagrams" routerLinkActive="active" class="sidebar-link">
              <span class="sidebar-icon"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
              <span class="hidden md:inline ml-3">Diagrams</span>
            </a>
            <a routerLink="query-engine" routerLinkActive="active" class="sidebar-link">
              <span class="sidebar-icon"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></span>
              <span class="hidden md:inline ml-3">Query Engine</span>
            </a>
            <a routerLink="upload-codebase" routerLinkActive="active" class="sidebar-link">
              <span class="sidebar-icon"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></span>
              <span class="hidden md:inline ml-3">Upload Codebase</span>
            </a>
            <a routerLink="security" routerLinkActive="active" class="sidebar-link">
              <span class="sidebar-icon"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
              <span class="hidden md:inline ml-3">Security</span>
            </a>
            <a routerLink="devops" routerLinkActive="active" class="sidebar-link">
              <span class="sidebar-icon"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M4 12h16"/><path d="M12 4v16"/></svg></span>
              <span class="hidden md:inline ml-3">DevOps</span>
            </a>
          </nav>
        </div>
        <!-- Theme Toggle -->
        <div class="mt-auto flex flex-col items-center md:items-start w-full pt-8">
          <button (click)="themeService.toggleTheme()" class="theme-toggle mb-4" [class.dark]="themeService.getCurrentTheme() === 'dark'">
            <span class="sr-only">Toggle Theme</span>
          </button>
          <button (click)="authService.logout()" class="text-xs text-gray-400 hover:text-highlight transition-colors">Logout</button>
        </div>
      </aside>
      <!-- Main Content -->
      <section class="flex-1 min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 p-4 md:p-8">
        <router-outlet></router-outlet>
      </section>
    </div>
  `,
  styles: [`
    .sidebar-link {
      @apply flex items-center px-3 py-2 rounded-lg text-white hover:bg-neon-purple/20 transition-all duration-200 relative;
    }
    .sidebar-link.active {
      @apply bg-gradient-to-r from-neon-purple to-electric-blue text-highlight font-bold;
      box-shadow: 0 0 10px #8E2DE2, 0 0 20px #4A00E0;
      text-shadow: 0 0 5px currentColor, 0 0 10px currentColor;
    }
    .sidebar-icon {
      @apply flex items-center justify-center w-8 h-8;
    }
    .sidebar {
      min-width: 5rem;
      max-width: 16rem;
      transition: all 0.3s;
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  user: User | null = null;
  constructor(
    public themeService: ThemeService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  ngAfterViewInit() {
    gsap.from('.sidebar', {
      duration: 1,
      x: -60,
      opacity: 0,
      ease: 'power3.out'
    });
    gsap.from('section', {
      duration: 1,
      y: 40,
      opacity: 0,
      delay: 0.3,
      ease: 'power3.out'
    });
  }
} 