import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-black">
      <!-- Hero Section -->
      <section class="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div class="absolute inset-0 bg-black/50"></div>
        <div class="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h1 class="text-6xl md:text-8xl font-bold mb-6 text-white" style="text-shadow: 0 0 5px currentColor, 0 0 10px currentColor;">
            <span class="text-neon-purple">Stack</span><span class="text-electric-blue">Sketch</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Revolutionize your codebase visualization with AI-powered architecture diagrams, 
            real-time collaboration, and intelligent code analysis
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="neon-button glass px-8 py-4 text-lg font-semibold text-white rounded-lg bg-gradient-to-r from-neon-purple to-electric-blue">
              Get Started Free
            </button>
            <button class="neon-button glass px-8 py-4 text-lg font-semibold text-white rounded-lg border border-neon-purple">
              Watch Demo
            </button>
          </div>
        </div>
        
        <!-- Animated Background Elements -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="floating-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
            <div class="shape shape-4"></div>
            <div class="shape shape-5"></div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-20 px-4 bg-black border-t border-gray-800">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">Powerful Features</h2>
            <p class="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to visualize, analyze, and optimize your codebase architecture
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="feature-card glass p-8 rounded-xl">
              <div class="w-16 h-16 bg-gradient-to-r from-neon-purple to-electric-blue rounded-lg flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-white mb-4">AI-Powered Analysis</h3>
              <p class="text-gray-300">Advanced machine learning algorithms analyze your codebase and generate intelligent architecture insights.</p>
            </div>

            <div class="feature-card glass p-8 rounded-xl">
              <div class="w-16 h-16 bg-gradient-to-r from-electric-blue to-highlight rounded-lg flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-white mb-4">Interactive Diagrams</h3>
              <p class="text-gray-300">Create beautiful, interactive architecture diagrams with drag-and-drop functionality and real-time collaboration.</p>
            </div>

            <div class="feature-card glass p-8 rounded-xl">
              <div class="w-16 h-16 bg-gradient-to-r from-highlight to-neon-purple rounded-lg flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-white mb-4">Security Insights</h3>
              <p class="text-gray-300">Comprehensive security analysis with vulnerability detection and compliance reporting.</p>
            </div>

            <div class="feature-card glass p-8 rounded-xl">
              <div class="w-16 h-16 bg-gradient-to-r from-neon-purple to-highlight rounded-lg flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-white mb-4">Performance Optimization</h3>
              <p class="text-gray-300">Identify bottlenecks and optimize your application performance with detailed analytics.</p>
            </div>

            <div class="feature-card glass p-8 rounded-xl">
              <div class="w-16 h-16 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-white mb-4">Team Collaboration</h3>
              <p class="text-gray-300">Real-time collaboration tools with version control and team management features.</p>
            </div>

            <div class="feature-card glass p-8 rounded-xl">
              <div class="w-16 h-16 bg-gradient-to-r from-highlight to-electric-blue rounded-lg flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-white mb-4">Advanced Analytics</h3>
              <p class="text-gray-300">Comprehensive analytics dashboard with custom reports and data visualization.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Statistics Section -->
      <section class="py-20 px-4 bg-gradient-to-r from-black via-gray-900 to-black border-t border-gray-800">
        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div class="stat-card">
              <div class="text-4xl md:text-5xl font-bold text-neon-purple mb-2" data-value="10000">0</div>
              <div class="text-gray-300">Active Users</div>
            </div>
            <div class="stat-card">
              <div class="text-4xl md:text-5xl font-bold text-electric-blue mb-2" data-value="50000">0</div>
              <div class="text-gray-300">Diagrams Created</div>
            </div>
            <div class="stat-card">
              <div class="text-4xl md:text-5xl font-bold text-highlight mb-2" data-value="99">0</div>
              <div class="text-gray-300">Uptime %</div>
            </div>
            <div class="stat-card">
              <div class="text-4xl md:text-5xl font-bold text-neon-purple mb-2" data-value="24">0</div>
              <div class="text-gray-300">Hours Support</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="py-20 px-4 bg-black border-t border-gray-800">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">What Our Users Say</h2>
            <p class="text-xl text-gray-300">Join thousands of developers who trust StackSketch</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="testimonial-card glass p-8 rounded-xl">
              <div class="flex items-center mb-6">
                <div class="w-12 h-12 bg-gradient-to-r from-neon-purple to-electric-blue rounded-full flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div class="ml-4">
                  <div class="text-white font-semibold">Sarah Chen</div>
                  <div class="text-gray-400">Senior Developer</div>
                </div>
              </div>
              <p class="text-gray-300 italic">"StackSketch has completely transformed how we visualize our microservices architecture. The AI insights are incredibly accurate!"</p>
            </div>

            <div class="testimonial-card glass p-8 rounded-xl">
              <div class="flex items-center mb-6">
                <div class="w-12 h-12 bg-gradient-to-r from-electric-blue to-highlight rounded-full flex items-center justify-center text-white font-bold text-lg">
                  M
                </div>
                <div class="ml-4">
                  <div class="text-white font-semibold">Mike Rodriguez</div>
                  <div class="text-gray-400">DevOps Engineer</div>
                </div>
              </div>
              <p class="text-gray-300 italic">"The security analysis feature helped us identify critical vulnerabilities we had missed. Game changer for our security posture."</p>
            </div>

            <div class="testimonial-card glass p-8 rounded-xl">
              <div class="flex items-center mb-6">
                <div class="w-12 h-12 bg-gradient-to-r from-highlight to-neon-purple rounded-full flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
                <div class="ml-4">
                  <div class="text-white font-semibold">Alex Thompson</div>
                  <div class="text-gray-400">Tech Lead</div>
                </div>
              </div>
              <p class="text-gray-300 italic">"The collaboration features are amazing. Our team can now work together on architecture diagrams in real-time."</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section class="py-20 px-4 bg-gradient-to-r from-black via-gray-900 to-black border-t border-gray-800">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">Choose Your Plan</h2>
            <p class="text-xl text-gray-300">Start free and scale as you grow</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="pricing-card glass p-8 rounded-xl flex flex-col">
              <div class="text-center mb-8">
                <h3 class="text-2xl font-bold text-white mb-4">Starter</h3>
                <div class="text-4xl font-bold text-neon-purple mb-2">$0</div>
                <div class="text-gray-400">Forever free</div>
              </div>
              <ul class="space-y-4 mb-8">
                <li class="flex items-center text-gray-300">
                  <svg class="w-5 h-5 text-highlight mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Up to 5 diagrams
                </li>
                <li class="flex items-center text-gray-300">
                  <svg class="w-5 h-5 text-highlight mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Basic AI analysis
                </li>
                <li class="flex items-center text-gray-300">
                  <svg class="w-5 h-5 text-highlight mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Community support
                </li>
              </ul>
              <div class="mt-auto">
                <button class="w-full neon-button glass py-3 text-white rounded-lg border border-neon-purple">
                  Get Started
                </button>
              </div>
            </div>

            <div class="pricing-card glass p-8 rounded-xl border-2 border-neon-purple relative flex flex-col">
              <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span class="bg-neon-purple text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
              </div>
              <div class="text-center mb-8">
                <h3 class="text-2xl font-bold text-white mb-4">Pro</h3>
                <div class="text-4xl font-bold text-neon-purple mb-2">$29</div>
                <div class="text-gray-400">per month</div>
              </div>
              <ul class="space-y-4 mb-8">
                <li class="flex items-center text-gray-300">
                  <svg class="w-5 h-5 text-highlight mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Unlimited diagrams
                </li>
                <li class="flex items-center text-gray-300">
                  <svg class="w-5 h-5 text-highlight mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Advanced AI features
                </li>
                <li class="flex items-center text-gray-300">
                  <svg class="w-5 h-5 text-highlight mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Team collaboration
                </li>
                <li class="flex items-center text-gray-300">
                  <svg class="w-5 h-5 text-highlight mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Priority support
                </li>
              </ul>
              <div class="mt-auto">
                <button class="w-full neon-button glass py-3 text-white rounded-lg bg-gradient-to-r from-neon-purple to-electric-blue">
                  Start Free Trial
                </button>
              </div>
            </div>

            <div class="pricing-card glass p-8 rounded-xl flex flex-col">
              <div class="text-center mb-8">
                <h3 class="text-2xl font-bold text-white mb-4">Enterprise</h3>
                <div class="text-4xl font-bold text-neon-purple mb-2">Custom</div>
                <div class="text-gray-400">Contact sales</div>
              </div>
              <ul class="space-y-4 mb-8">
                <li class="flex items-center text-gray-300">
                  <svg class="w-5 h-5 text-highlight mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Everything in Pro
                </li>
                <li class="flex items-center text-gray-300">
                  <svg class="w-5 h-5 text-highlight mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Custom integrations
                </li>
                <li class="flex items-center text-gray-300">
                  <svg class="w-5 h-5 text-highlight mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Dedicated support
                </li>
                <li class="flex items-center text-gray-300">
                  <svg class="w-5 h-5 text-highlight mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  SLA guarantee
                </li>
              </ul>
              <div class="mt-auto">
                <button class="w-full neon-button glass py-3 text-white rounded-lg border border-neon-purple">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-20 px-4 bg-black border-t border-gray-800">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Codebase?</h2>
          <p class="text-xl text-gray-300 mb-8">
            Join thousands of developers who are already using StackSketch to visualize and optimize their architecture
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="neon-button glass px-8 py-4 text-lg font-semibold text-white rounded-lg bg-gradient-to-r from-neon-purple to-electric-blue">
              Start Your Free Trial
            </button>
            <button class="neon-button glass px-8 py-4 text-lg font-semibold text-white rounded-lg border border-neon-purple">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .floating-shapes {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    .shape {
      position: absolute;
      border-radius: 50%;
      background: linear-gradient(45deg, var(--neon-purple), var(--electric-blue));
      opacity: 0.1;
      animation: float 6s ease-in-out infinite;
    }

    .shape-1 {
      width: 100px;
      height: 100px;
      top: 20%;
      left: 10%;
      animation-delay: 0s;
    }

    .shape-2 {
      width: 150px;
      height: 150px;
      top: 60%;
      right: 10%;
      animation-delay: 2s;
    }

    .shape-3 {
      width: 80px;
      height: 80px;
      bottom: 20%;
      left: 20%;
      animation-delay: 4s;
    }

    .shape-4 {
      width: 120px;
      height: 120px;
      top: 30%;
      right: 30%;
      animation-delay: 1s;
    }

    .shape-5 {
      width: 60px;
      height: 60px;
      bottom: 40%;
      right: 20%;
      animation-delay: 3s;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-20px) rotate(180deg);
      }
    }

    .feature-card {
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .feature-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(142, 45, 226, 0.2);
    }

    .stat-card {
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: scale(1.05);
    }

    .testimonial-card {
      transition: all 0.3s ease;
    }

    .testimonial-card:hover {
      transform: translateY(-5px);
    }

    .pricing-card {
      transition: all 0.3s ease;
    }

    .pricing-card:hover {
      transform: translateY(-10px);
    }

    /* Ensure buttons are always visible */
    button {
      opacity: 1 !important;
      visibility: visible !important;
    }

    /* Ensure stats are visible */
    [data-value] {
      opacity: 1 !important;
      visibility: visible !important;
    }
  `]
})
export class HomeComponent implements OnInit, AfterViewInit {
  ngOnInit() {}

  ngAfterViewInit() {
    this.initAnimations();
  }

  private initAnimations() {
    // Simple hero animations
    gsap.from('h1', {
      duration: 1.5,
      y: 100,
      opacity: 0,
      ease: 'power3.out'
    });

    gsap.from('p', {
      duration: 1.5,
      y: 50,
      opacity: 0,
      delay: 0.3,
      ease: 'power3.out'
    });

    // Ensure buttons stay visible after animation
    gsap.from('button', {
      duration: 1,
      y: 30,
      opacity: 0,
      delay: 0.6,
      stagger: 0.2,
      ease: 'power3.out',
      onComplete: () => {
        // Force buttons to stay visible
        gsap.set('button', { opacity: 1, visibility: 'visible' });
      }
    });

    // Statistics counter animation with fallback
    const counters = document.querySelectorAll('[data-value]');
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-value') || '0');
      const suffix = counter.textContent?.includes('%') ? '%' : '';
      
      // Try ScrollTrigger first
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: counter,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
      
      tl.to(counter, {
        duration: 2,
        textContent: target + suffix,
        ease: 'power2.out',
        snap: { textContent: 1 }
      });

      // Fallback: if ScrollTrigger doesn't work, animate after 3 seconds
      setTimeout(() => {
        if (counter.textContent === '0') {
          gsap.to(counter, {
            duration: 2,
            textContent: target + suffix,
            ease: 'power2.out',
            snap: { textContent: 1 }
          });
        }
      }, 3000);
    });

    // Floating shapes animation
    gsap.to('.shape', {
      y: -20,
      rotation: 360,
      duration: 6,
      ease: 'power2.inOut',
      stagger: 1,
      repeat: -1,
      yoyo: true
    });
  }
} 