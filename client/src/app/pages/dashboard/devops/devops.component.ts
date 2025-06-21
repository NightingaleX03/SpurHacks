import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-devops',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-white mb-6">DevOps Pipeline</h2>
      <div class="glass p-8 rounded-xl mb-6 pipeline">
        <div class="flex items-center justify-between mb-4">
          <span class="text-lg font-semibold text-highlight">CI/CD Pipeline</span>
          <span class="text-xs text-gray-400">Last run: 1 min ago</span>
        </div>
        <div class="flex items-center space-x-4 justify-center mb-6">
          <div class="flex flex-col items-center">
            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-neon-purple to-electric-blue flex items-center justify-center text-white font-bold shadow-lg animate-pulse">1</div>
            <span class="text-xs text-gray-400 mt-2">Build</span>
          </div>
          <div class="w-8 h-1 bg-gradient-to-r from-neon-purple to-electric-blue"></div>
          <div class="flex flex-col items-center">
            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-electric-blue to-highlight flex items-center justify-center text-white font-bold shadow-lg animate-pulse">2</div>
            <span class="text-xs text-gray-400 mt-2">Test</span>
          </div>
          <div class="w-8 h-1 bg-gradient-to-r from-electric-blue to-highlight"></div>
          <div class="flex flex-col items-center">
            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-highlight to-neon-purple flex items-center justify-center text-white font-bold shadow-lg animate-pulse">3</div>
            <span class="text-xs text-gray-400 mt-2">Deploy</span>
          </div>
        </div>
        <div class="flex justify-end gap-4">
          <button class="neon-button px-6 py-2 bg-gradient-to-r from-neon-purple to-electric-blue text-white font-medium rounded-lg border border-neon-purple hover:border-highlight transition-all duration-300">One-click Optimization</button>
          <button class="neon-button px-6 py-2 bg-gradient-to-r from-electric-blue to-highlight text-white font-medium rounded-lg border border-electric-blue hover:border-highlight transition-all duration-300">Trigger Deployment</button>
        </div>
      </div>
      <div class="text-sm text-gray-400">Terraform, Kubernetes, and GitHub integration status: <span class="text-green-400">Connected</span></div>
    </div>
  `,
  styles: []
})
export class DevOpsComponent implements AfterViewInit {
  ngAfterViewInit() {
    gsap.from('.pipeline', {
      duration: 0.8,
      y: 30,
      opacity: 0,
      ease: 'power3.out',
    });
  }
} 