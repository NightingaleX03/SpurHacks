import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="glass p-6 rounded-xl flex flex-col items-center text-center">
        <div class="text-3xl font-bold text-neon-purple mb-2">99.9%</div>
        <div class="text-gray-400 mb-1">System Health</div>
        <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
          <div class="h-full bg-gradient-to-r from-neon-purple to-electric-blue" style="width:99.9%"></div>
        </div>
      </div>
      <div class="glass p-6 rounded-xl flex flex-col items-center text-center">
        <div class="text-3xl font-bold text-electric-blue mb-2">3</div>
        <div class="text-gray-400 mb-1">Last Updated Diagrams</div>
        <ul class="text-xs text-gray-300 mt-2 space-y-1">
          <li>• User Auth Flow</li>
          <li>• API Gateway</li>
          <li>• Microservices Mesh</li>
        </ul>
      </div>
      <div class="glass p-6 rounded-xl flex flex-col items-center text-center">
        <div class="text-3xl font-bold text-highlight mb-2">Passing</div>
        <div class="text-gray-400 mb-1">CI/CD Build Status</div>
        <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
          <div class="h-full bg-highlight" style="width:100%"></div>
        </div>
      </div>
      <div class="glass p-6 rounded-xl flex flex-col items-center text-center">
        <div class="text-3xl font-bold text-neon-purple mb-2">A+</div>
        <div class="text-gray-400 mb-1">Security Rating</div>
        <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
          <div class="h-full bg-neon-purple" style="width:100%"></div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class OverviewComponent implements AfterViewInit {
  ngAfterViewInit() {
    gsap.from('.glass', {
      duration: 0.8,
      y: 40,
      opacity: 0,
      stagger: 0.15,
      ease: 'power3.out',
    });
  }
} 