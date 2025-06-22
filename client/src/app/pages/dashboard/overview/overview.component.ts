import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 md:p-6">
      <h1 class="text-3xl font-bold text-white mb-6">Welcome, Sarah!</h1>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Column 1 -->
        <div class="flex flex-col gap-6">
          <!-- System Health -->
          <div class="glass p-6 rounded-xl">
            <h2 class="text-xl font-semibold text-white mb-4">System Health Overview</h2>
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-300">Uptime (7d)</span>
              <span class="font-bold text-green-400">99.9%</span>
            </div>
            <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
              <div class="h-full bg-green-400" style="width:99.9%"></div>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-300">AI Status</span>
              <span class="text-white flex items-center"><span class="w-2 h-2 rounded-full bg-green-400 mr-2"></span>Running</span>
            </div>
            <div class="flex justify-between items-center text-sm mt-1">
              <span class="text-gray-300">AI Model</span>
              <span class="text-white">Gemini-1.5</span>
            </div>
            <div class="flex justify-between items-center text-sm mt-1">
              <span class="text-gray-300">Services Monitored</span>
              <span class="text-white">12</span>
            </div>
          </div>
          
          <!-- Recent Diagrams -->
          <div class="glass p-6 rounded-xl">
            <h2 class="text-xl font-semibold text-white mb-4">Recent Diagrams</h2>
            <ul class="space-y-3 text-sm">
              <li class="flex justify-between items-center">
                <span class="text-white">User Auth Flow</span>
                <span class="text-gray-400">🕒 Jun 21, 3:04 PM</span>
              </li>
              <li class="flex justify-between items-center">
                <span class="text-white">API Gateway</span>
                <span class="text-gray-400">🛠️ Modified Jun 20</span>
              </li>
              <li class="flex justify-between items-center">
                <span class="text-white">Microservices Mesh</span>
                <span class="text-gray-400">✅ Deployed Jun 19</span>
              </li>
            </ul>
            <button class="action-button mt-4 w-full">View All Diagrams</button>
          </div>
          
          <!-- Project Insights -->
          <div class="glass p-6 rounded-xl">
            <h2 class="text-xl font-semibold text-white mb-4">Project Insights / Activity</h2>
            <div class="grid grid-cols-2 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold text-electric-blue">5</div>
                <div class="text-sm text-gray-300">Team Members</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-electric-blue">2</div>
                <div class="text-sm text-gray-300">Active Projects</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-electric-blue">7</div>
                <div class="text-sm text-gray-300">Diagrams this Week</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-electric-blue">2h</div>
                <div class="text-sm text-gray-300">Last Login</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Column 2 -->
        <div class="flex flex-col gap-6">
          <!-- Security & Compliance -->
          <div class="glass p-6 rounded-xl">
            <h2 class="text-xl font-semibold text-white mb-4">Security & Compliance</h2>
            <div class="flex justify-between items-center mb-3">
                <span class="text-gray-300">Security Rating</span>
                <span class="text-2xl font-bold text-highlight">A+</span>
            </div>
            <div class="text-gray-300 text-sm mb-2">Compliance Coverage:</div>
            <ul class="space-y-2 text-sm">
                <li class="flex justify-between items-center"><span class="text-gray-200">GDPR</span><span class="text-green-400">✅</span></li>
                <li class="flex justify-between items-center"><span class="text-gray-200">SOC 2</span><span class="text-yellow-400">⚠️</span></li>
                <li class="flex justify-between items-center"><span class="text-gray-200">HIPAA</span><span class="text-green-400">✅</span></li>
            </ul>
            <div class="border-t border-gray-700 my-4"></div>
            <div class="flex justify-between items-center">
              <span class="text-gray-300">Vulnerabilities</span>
              <span class="font-bold text-yellow-400">3 Detected</span>
            </div>
            <button class="action-button mt-4 w-full">View Security Report</button>
          </div>

          <!-- CI/CD Pipeline -->
          <div class="glass p-6 rounded-xl">
            <h2 class="text-xl font-semibold text-white mb-4">CI/CD Pipeline Status</h2>
             <div class="flex justify-between items-center mb-3">
                <span class="text-gray-300">Status</span>
                <span class="text-lg font-bold text-green-400">🟢 Passing</span>
            </div>
            <div class="text-sm space-y-1 text-gray-300">
              <div class="flex justify-between"><span>Pipelines:</span><span class="text-white">3</span></div>
              <div class="flex justify-between"><span>Last Build:</span><span class="text-white">4 hours ago</span></div>
              <div class="flex justify-between"><span>Environments:</span><span class="text-white">Dev, Staging, Prod</span></div>
            </div>
             <button class="action-button mt-4 w-full">View Deployment Logs</button>
          </div>

          <!-- AI Q&A -->
          <div class="glass p-6 rounded-xl">
            <h2 class="text-xl font-semibold text-white mb-4">AI Q&A Summary</h2>
            <ul class="space-y-2 text-sm text-gray-300">
                <li class="truncate">"How does the login system work?" <span class="text-green-400">→ Answered ✅</span></li>
                <li class="truncate">"Which services use PostgreSQL?" <span class="text-green-400">→ Answered ✅</span></li>
            </ul>
            <button class="action-button mt-4 w-full">Ask a New Question</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .action-button { 
      @apply px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors text-sm w-full; 
    }
  `]
})
export class OverviewComponent implements AfterViewInit {
  ngAfterViewInit() {
    gsap.from('.glass', {
      duration: 0.8,
      y: 40,
      opacity: 0,
      stagger: 0.1,
      ease: 'power3.out',
    });
  }
} 