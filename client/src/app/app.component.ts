import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NavbarComponent } from './components/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen bg-dark-bg">
      <app-navbar></app-navbar>
      <main [ngClass]="isAuthenticated ? '' : 'pt-20'">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  isAuthenticated = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    console.log('AppComponent: Initializing...');
    this.authService.isAuthenticated$.subscribe(
      (isAuth: boolean) => {
        console.log('AppComponent: Authentication state changed:', isAuth);
        this.isAuthenticated = isAuth;
      }
    );
  }
} 