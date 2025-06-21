import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-enterprise-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col">
      <h2 class="text-2xl font-bold text-white mb-6">Enterprise Management</h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Employee Management -->
        <div class="glass p-6 rounded-xl border border-neon-purple/30">
          <h3 class="text-xl font-semibold text-white mb-4">Employee Management</h3>
          <div class="space-y-4">
            <div class="p-4 bg-dark-surface/50 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-white">Mike Chen</h4>
                  <p class="text-sm text-gray-400">Senior Developer</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-500">TechCorp Solutions</p>
                  <p class="text-xs text-green-400">Active</p>
                </div>
              </div>
            </div>
            <div class="p-4 bg-dark-surface/50 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-white">Emma Rodriguez</h4>
                  <p class="text-sm text-gray-400">Junior Developer</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-500">TechCorp Solutions</p>
                  <p class="text-xs text-green-400">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Permission Management -->
        <div class="glass p-6 rounded-xl border border-neon-purple/30">
          <h3 class="text-xl font-semibold text-white mb-4">Permission Settings</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-dark-surface/50 rounded-lg">
              <span class="text-white">View Diagrams</span>
              <div class="w-12 h-6 bg-green-500 rounded-full relative">
                <div class="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 bg-dark-surface/50 rounded-lg">
              <span class="text-white">Generate Diagrams</span>
              <div class="w-12 h-6 bg-green-500 rounded-full relative">
                <div class="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 bg-dark-surface/50 rounded-lg">
              <span class="text-white">Upload Codebases</span>
              <div class="w-12 h-6 bg-gray-600 rounded-full relative">
                <div class="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 bg-dark-surface/50 rounded-lg">
              <span class="text-white">View Security</span>
              <div class="w-12 h-6 bg-gray-600 rounded-full relative">
                <div class="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Shared Resources -->
      <div class="mt-8">
        <h3 class="text-xl font-semibold text-white mb-4">Shared Resources</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="glass p-4 rounded-lg border border-neon-purple/30">
            <h4 class="font-semibold text-white mb-2">User Authentication Flow</h4>
            <p class="text-sm text-gray-400 mb-2">Sequence Diagram</p>
            <p class="text-xs text-gray-500">Shared with: Mike Chen, Emma Rodriguez</p>
          </div>
          <div class="glass p-4 rounded-lg border border-neon-purple/30">
            <h4 class="font-semibold text-white mb-2">Frontend React App</h4>
            <p class="text-sm text-gray-400 mb-2">TypeScript/React</p>
            <p class="text-xs text-gray-500">Shared with: Mike Chen, Emma Rodriguez</p>
          </div>
          <div class="glass p-4 rounded-lg border border-neon-purple/30">
            <h4 class="font-semibold text-white mb-2">Microservices Architecture</h4>
            <p class="text-sm text-gray-400 mb-2">Component Diagram</p>
            <p class="text-xs text-gray-500">Shared with: Mike Chen</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class EnterpriseManagementComponent {
  constructor() {}
} 