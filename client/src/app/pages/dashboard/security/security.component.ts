import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-white mb-6">Security & Compliance</h2>
      <div class="glass p-8 rounded-xl mb-6 security-scan">
        <div class="flex items-center justify-between mb-4">
          <span class="text-lg font-semibold text-highlight">Compliance Score: <span class="font-bold text-neon-purple">92% (SOC2, GDPR, HIPAA)</span></span>
          <span class="text-xs text-gray-400">Last scan: 2 min ago</span>
        </div>
        <ul class="text-sm text-gray-300 space-y-2">
          <li>• <span class="text-red-400">IAM role missing for DB access</span></li>
          <li>• <span class="text-yellow-400">Open port: 8080 (API Gateway)</span></li>
          <li>• <span class="text-green-400">Firewall rules: OK</span></li>
        </ul>
        <button class="neon-button mt-6 px-6 py-2 bg-gradient-to-r from-neon-purple to-electric-blue text-white font-medium rounded-lg border border-neon-purple hover:border-highlight transition-all duration-300">Suggest Fixes</button>
      </div>
    </div>
  `,
  styles: []
})
export class SecurityComponent implements AfterViewInit {
  ngAfterViewInit() {
    gsap.from('.security-scan', {
      duration: 0.8,
      y: 30,
      opacity: 0,
      ease: 'power3.out',
    });
  }
} 