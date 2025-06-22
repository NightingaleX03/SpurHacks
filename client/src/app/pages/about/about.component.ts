import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-black">
      <!-- Hero Section -->
      <section class="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div class="absolute inset-0 bg-black/50"></div>
        <div class="relative z-10 text-center max-w-4xl mx-auto">
          <h1 class="text-5xl md:text-7xl font-bold mb-6 text-white">
            <span class="text-neon-purple">About</span> <span class="text-electric-blue">StackSketch</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Revolutionizing codebase visualization through AI-powered architecture diagrams and intelligent analysis
          </p>
          <div class="w-24 h-1 bg-gradient-to-r from-neon-purple to-electric-blue mx-auto rounded-full"></div>
        </div>
        
        <!-- Animated Background Elements -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="floating-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
          </div>
        </div>
      </section>

      <!-- Mission Section -->
      <section class="py-20 px-4 bg-black border-t border-gray-800">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">Our Mission</h2>
            <p class="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              We believe that understanding code architecture shouldn't be a complex puzzle. StackSketch transforms 
              the way developers visualize, analyze, and collaborate on their codebases through cutting-edge AI 
              technology and intuitive design.
            </p>
          </div>
        </div>
      </section>

      <!-- Founders Section -->
      <section class="py-20 px-4 bg-gradient-to-r from-black via-gray-900 to-black border-t border-gray-800">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">Meet Our Founders</h2>
            <p class="text-xl text-gray-300">The brilliant minds behind StackSketch</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Rosie -->
            <div class="founder-card bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-xl text-center">
              <div class="w-32 h-32 bg-gradient-to-r from-neon-purple to-electric-blue rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-white font-bold text-4xl">R</span>
              </div>
              <h3 class="text-2xl font-bold text-white mb-2">Rosie</h3>
              <p class="text-highlight font-semibold mb-4">Ontario Tech University</p>
              <p class="text-gray-300 mb-4">3rd Year Student</p>
              <p class="text-gray-400 text-sm leading-relaxed">
                Passionate about AI and software architecture. Leading the technical vision and AI integration for StackSketch.
              </p>
            </div>

            <!-- Sarah -->
            <div class="founder-card bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-xl text-center">
              <div class="w-32 h-32 bg-gradient-to-r from-electric-blue to-highlight rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-white font-bold text-4xl">S</span>
              </div>
              <h3 class="text-2xl font-bold text-white mb-2">Sarah</h3>
              <p class="text-highlight font-semibold mb-4">Ontario Tech University</p>
              <p class="text-gray-300 mb-4">2nd Year Student</p>
              <p class="text-gray-400 text-sm leading-relaxed">
                Full stack developer crafting clean interfaces and powerful backend systems — building seamless products end to end.
              </p>
            </div>

            <!-- Cedric -->
            <div class="founder-card bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-xl text-center">
              <div class="w-32 h-32 bg-gradient-to-r from-highlight to-neon-purple rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-white font-bold text-4xl">C</span>
              </div>
              <h3 class="text-2xl font-bold text-white mb-2">Cedric</h3>
              <p class="text-highlight font-semibold mb-4">University of Waterloo</p>
              <p class="text-gray-300 mb-4">2nd Year Student</p>
              <p class="text-gray-400 text-sm leading-relaxed">
                Backend architect enthusiast. Building scalable infrastructure and robust systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Story Section -->
      <section class="py-20 px-4 bg-black border-t border-gray-800">
        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">Our Story</h2>
              <p class="text-lg text-gray-300 mb-6 leading-relaxed">
                StackSketch was born from a shared frustration with existing code visualization tools. 
                As students working on complex projects, we found ourselves spending more time trying to 
                understand existing codebases than actually building new features.
              </p>
              <p class="text-lg text-gray-300 mb-6 leading-relaxed">
                We envisioned a tool that could automatically generate clear, interactive architecture 
                diagrams from code, making it easier for teams to collaborate and understand their 
                codebase structure.
              </p>
              <p class="text-lg text-gray-300 leading-relaxed">
                Today, StackSketch is helping developers worldwide visualize their code architecture 
                with unprecedented clarity and ease.
              </p>
            </div>
            <div class="glass p-8 rounded-xl">
              <div class="text-center">
                <div class="w-24 h-24 bg-gradient-to-r from-neon-purple to-electric-blue rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-white mb-4">Innovation Through Collaboration</h3>
                <p class="text-gray-300">
                  Three universities, one vision: Making code architecture accessible to everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section class="py-20 px-4 bg-gradient-to-r from-black via-gray-900 to-black border-t border-gray-800">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">Get In Touch</h2>
            <p class="text-xl text-gray-300">Have questions? We'd love to hear from you!</p>
          </div>
          
          <div class="glass p-8 md:p-12 rounded-2xl">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Contact Info -->
              <div>
                <h3 class="text-2xl font-bold text-white mb-6">Contact Information</h3>
                <div class="space-y-4">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-neon-purple to-electric-blue rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-white font-semibold">Email</p>
                      <p class="text-gray-300">hello&#64;stacksketch.dev</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-electric-blue to-highlight rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-white font-semibold">Location</p>
                      <p class="text-gray-300">Ontario, Canada</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-highlight to-neon-purple rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-white font-semibold">Response Time</p>
                      <p class="text-gray-300">Within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contact Form -->
              <div>
                <h3 class="text-2xl font-bold text-white mb-6">Send us a Message</h3>
                <form class="space-y-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Your Name"
                      class="w-full px-4 py-3 bg-dark-surface/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <input 
                      type="email" 
                      placeholder="Your Email"
                      class="w-full px-4 py-3 bg-dark-surface/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <textarea 
                      placeholder="Your Message"
                      rows="4"
                      class="w-full px-4 py-3 bg-dark-surface/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20 transition-all duration-300 resize-none"
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    class="neon-button w-full py-3 bg-gradient-to-r from-neon-purple to-electric-blue text-white font-semibold rounded-lg border border-neon-purple hover:border-highlight transition-all duration-300"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
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
      animation: float 8s ease-in-out infinite;
    }

    .shape-1 {
      width: 120px;
      height: 120px;
      top: 20%;
      left: 10%;
      animation-delay: 0s;
    }

    .shape-2 {
      width: 80px;
      height: 80px;
      top: 60%;
      right: 15%;
      animation-delay: 3s;
    }

    .shape-3 {
      width: 100px;
      height: 100px;
      bottom: 30%;
      left: 20%;
      animation-delay: 6s;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-30px) rotate(180deg);
      }
    }

    .founder-card {
      transition: all 0.3s ease;
      cursor: pointer;
      background: rgba(31, 41, 55, 0.8) !important;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(75, 85, 99, 1);
      opacity: 1 !important;
      visibility: visible !important;
      position: relative;
      z-index: 1;
    }

    .founder-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(142, 45, 226, 0.2);
      border-color: rgba(142, 45, 226, 0.5);
    }
  `]
})
export class AboutComponent implements OnInit, AfterViewInit {
  ngOnInit() {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
  }

  ngAfterViewInit() {
    this.initAnimations();
  }

  private initAnimations() {
    // Hero animations
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

    // Founder cards animation - ensure they stay visible
    gsap.from('.founder-card', {
      duration: 1,
      y: 50,
      opacity: 0,
      delay: 0.6,
      stagger: 0.2,
      ease: 'power3.out',
      onComplete: () => {
        // Force cards to stay visible after animation
        gsap.set('.founder-card', { 
          opacity: 1, 
          visibility: 'visible',
          y: 0 
        });
      }
    });

    // Floating shapes animation
    gsap.to('.shape', {
      y: -30,
      rotation: 360,
      duration: 8,
      ease: 'power2.inOut',
      stagger: 2,
      repeat: -1,
      yoyo: true
    });
  }
} 