import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
// import { EnterpriseService } from '../../services/enterprise.service';

@Component({
  selector: 'app-query-engine',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-white mb-6">Query Engine</h2>
      <form class="mb-6 flex items-center gap-4">
        <input type="text" class="flex-1 px-4 py-3 bg-dark-surface/50 border border-neon-purple rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-highlight focus:ring-2 focus:ring-highlight/20 transition-all duration-300" placeholder="How does the login system work?" />
        <button type="submit" class="neon-button px-6 py-2 bg-gradient-to-r from-neon-purple to-electric-blue text-white font-medium rounded-lg border border-neon-purple hover:border-highlight transition-all duration-300">Search</button>
      </form>
      <div class="space-y-4">
        <div class="glass p-6 rounded-xl code-card">
          <div class="flex items-center justify-between cursor-pointer mb-2">
            <span class="font-semibold text-highlight">login.service.ts</span>
            <span class="text-xs text-gray-400">/src/app/services/</span>
          </div>
          <pre class="bg-dark-surface/80 rounded p-4 text-xs text-white overflow-x-auto"><code>// login() method
if (user.email === input.email && user.password === input.password) {{ '{' }}
  // Auth success
  return token;
{{ '}' }}</code></pre>
        </div>
        <div class="glass p-6 rounded-xl code-card">
          <div class="flex items-center justify-between cursor-pointer mb-2">
            <span class="font-semibold text-highlight">auth.guard.ts</span>
            <span class="text-xs text-gray-400">/src/app/guards/</span>
          </div>
          <pre class="bg-dark-surface/80 rounded p-4 text-xs text-white overflow-x-auto"><code>// canActivate()
if (authService.isAuthenticated) {{ '{' }}
  return true;
{{ '}' }} else {{ '{' }}
  router.navigate(['/login']);
  return false;
{{ '}' }}</code></pre>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class QueryEngineComponent implements AfterViewInit {
  // isEmployee = false;
  // canViewQueryEngine = true;

  // constructor(private enterpriseService: EnterpriseService) {
  //   this.isEmployee = this.enterpriseService.isEmployee();
  //   if (this.isEmployee) {
  //     this.canViewQueryEngine = this.enterpriseService.canAccessFeature('canViewQueryEngine');
  //   }
  // }

  ngAfterViewInit() {
    gsap.from('.code-card', {
      duration: 0.8,
      y: 30,
      opacity: 0,
      stagger: 0.15,
      ease: 'power3.out',
    });
  }
} 