import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen pt-32 pb-20 px-6">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
          <h1 class="text-4xl md:text-6xl font-bold mb-6 neon-glow text-neon-purple">
            About StackSketch
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover the powerful features that make StackSketch the ultimate tool for modern software architecture and DevOps automation.
          </p>
        </div>

        <!-- Feature Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Create Architecture Diagrams -->
          <div class="glass p-8 rounded-xl hover:scale-105 transition-all duration-300 group feature-card">
            <div class="w-16 h-16 bg-gradient-to-r from-neon-purple to-electric-blue rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Create Architecture Diagrams</h3>
            <p class="text-gray-400 mb-4">
              Build comprehensive architecture diagrams from scratch using our intuitive drag-and-drop interface. Transform your ideas into professional visual representations.
            </p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• Drag-and-drop components</li>
              <li>• Real-time collaboration</li>
              <li>• Multiple diagram types</li>
            </ul>
          </div>

          <!-- Upload Codebase -->
          <div class="glass p-8 rounded-xl hover:scale-105 transition-all duration-300 group feature-card">
            <div class="w-16 h-16 bg-gradient-to-r from-electric-blue to-highlight rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Upload Codebase</h3>
            <p class="text-gray-400 mb-4">
              Upload your existing codebase and let StackSketch automatically generate and update architecture diagrams based on your actual code structure.
            </p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• Auto-diagram generation</li>
              <li>• Code structure analysis</li>
              <li>• Incremental updates</li>
            </ul>
          </div>

          <!-- Architecture Templates -->
          <div class="glass p-8 rounded-xl hover:scale-105 transition-all duration-300 group feature-card">
            <div class="w-16 h-16 bg-gradient-to-r from-highlight to-neon-purple rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Architecture Templates</h3>
            <p class="text-gray-400 mb-4">
              Choose from monolith, microservices, and serverless templates. Each style comes with pre-built components and best practices.
            </p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• Monolith patterns</li>
              <li>• Microservices architecture</li>
              <li>• Serverless templates</li>
            </ul>
          </div>

          <!-- Real-time Edits -->
          <div class="glass p-8 rounded-xl hover:scale-105 transition-all duration-300 group feature-card">
            <div class="w-16 h-16 bg-gradient-to-r from-neon-purple to-highlight rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Real-time Edits</h3>
            <p class="text-gray-400 mb-4">
              Make changes to your diagrams and see them update automatically. Collaborate with team members in real-time with live synchronization.
            </p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• Live collaboration</li>
              <li>• Auto-sync changes</li>
              <li>• Version control</li>
            </ul>
          </div>

          <!-- Export to Confluence -->
          <div class="glass p-8 rounded-xl hover:scale-105 transition-all duration-300 group feature-card">
            <div class="w-16 h-16 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Export to Confluence</h3>
            <p class="text-gray-400 mb-4">
              Seamlessly export your diagrams to Confluence for documentation. Keep your team documentation always up-to-date with the latest architecture.
            </p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• One-click export</li>
              <li>• Auto-update docs</li>
              <li>• Team integration</li>
            </ul>
          </div>

          <!-- Onboard Developers -->
          <div class="glass p-8 rounded-xl hover:scale-105 transition-all duration-300 group feature-card">
            <div class="w-16 h-16 bg-gradient-to-r from-highlight to-electric-blue rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Onboard Developers</h3>
            <p class="text-gray-400 mb-4">
              Use visual flows to quickly onboard new developers to your project. Show them the system architecture and code structure in an intuitive way.
            </p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• Visual onboarding</li>
              <li>• Interactive tutorials</li>
              <li>• Knowledge sharing</li>
            </ul>
          </div>

          <!-- DevOps Integration -->
          <div class="glass p-8 rounded-xl hover:scale-105 transition-all duration-300 group feature-card">
            <div class="w-16 h-16 bg-gradient-to-r from-neon-purple to-electric-blue rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">DevOps Integration</h3>
            <p class="text-gray-400 mb-4">
              Integrate with Terraform, Kubernetes, and CI/CD tools for automated deployment. Streamline your entire development workflow.
            </p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• Terraform integration</li>
              <li>• Kubernetes management</li>
              <li>• CI/CD automation</li>
            </ul>
          </div>

          <!-- Security Scanning -->
          <div class="glass p-8 rounded-xl hover:scale-105 transition-all duration-300 group feature-card">
            <div class="w-16 h-16 bg-gradient-to-r from-highlight to-neon-purple rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Security Scanning</h3>
            <p class="text-gray-400 mb-4">
              Scan for SOC 2, GDPR, HIPAA compliance and get intelligent suggestions for IAM and firewall configurations.
            </p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• SOC 2 compliance</li>
              <li>• GDPR & HIPAA</li>
              <li>• IAM optimization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AboutComponent implements OnInit, AfterViewInit {
  ngOnInit() {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
  }

  ngAfterViewInit() {
    // Staggered animations for feature cards with scroll trigger
    gsap.from('.feature-card', {
      duration: 0.8,
      y: 60,
      opacity: 0,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.feature-card',
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });

    // Header animation
    gsap.from('.text-4xl', {
      duration: 1,
      y: 40,
      opacity: 0,
      ease: 'power3.out'
    });

    gsap.from('.text-xl', {
      duration: 1,
      y: 30,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.2
    });
  }
} 