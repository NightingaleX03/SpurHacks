import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-upload-codebase',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-white mb-6">Upload Codebase</h2>
      <div class="glass p-8 rounded-xl flex flex-col items-center justify-center min-h-[200px] mb-6 upload-area">
        <div class="text-gray-400 mb-2">Drag & drop your .zip or folder here</div>
        <button class="neon-button px-6 py-2 bg-gradient-to-r from-neon-purple to-electric-blue text-white font-medium rounded-lg border border-neon-purple hover:border-highlight transition-all duration-300 mt-4">Auto-generate Diagrams</button>
      </div>
      <div class="text-sm text-gray-400">Use your uploaded codebase as a template for other projects.</div>
    </div>
  `,
  styles: []
})
export class UploadCodebaseComponent implements AfterViewInit {
  ngAfterViewInit() {
    gsap.from('.upload-area', {
      duration: 0.8,
      y: 30,
      opacity: 0,
      ease: 'power3.out',
    });
  }
} 