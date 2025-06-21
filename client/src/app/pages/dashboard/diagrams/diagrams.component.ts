import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-diagrams',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-white neon-glow">Architecture Diagrams</h2>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-400">Style:</span>
          <select class="bg-dark-surface text-white border border-neon-purple rounded px-3 py-1 focus:outline-none">
            <option>Monolith</option>
            <option>Microservices</option>
            <option>Serverless</option>
          </select>
        </div>
      </div>
      <div class="glass p-8 rounded-xl min-h-[300px] flex flex-wrap gap-8 items-center justify-center diagrams-canvas">
        <div class="bg-gradient-to-r from-neon-purple to-electric-blue text-white px-6 py-4 rounded-lg shadow-lg neon-glow diagram-block">User</div>
        <div class="bg-gradient-to-r from-electric-blue to-highlight text-white px-6 py-4 rounded-lg shadow-lg neon-glow diagram-block">API Gateway</div>
        <div class="bg-gradient-to-r from-neon-purple to-highlight text-white px-6 py-4 rounded-lg shadow-lg neon-glow diagram-block">Service</div>
        <div class="bg-gradient-to-r from-neon-purple to-light-card text-white px-6 py-4 rounded-lg shadow-lg neon-glow diagram-block">DB</div>
      </div>
      <div class="mt-6 flex justify-end">
        <button class="neon-button px-6 py-2 bg-gradient-to-r from-neon-purple to-electric-blue text-white font-medium rounded-lg border border-neon-purple hover:border-highlight transition-all duration-300">Export Diagram</button>
      </div>
    </div>
  `,
  styles: []
})
export class DiagramsComponent implements AfterViewInit {
  ngAfterViewInit() {
    gsap.from('.diagram-block', {
      duration: 0.8,
      y: 30,
      opacity: 0,
      stagger: 0.15,
      ease: 'power3.out',
    });
  }
} 