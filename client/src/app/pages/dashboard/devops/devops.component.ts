import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';

interface DeploymentStep {
  name: string;
  status: 'Pending' | 'In Progress' | 'Success' | 'Failed';
  timestamp?: string;
}

type IaCProvider = 'Terraform' | 'Kubernetes';

@Component({
  selector: 'app-devops',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-white mb-6">DevOps Pipeline Automation</h2>

      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4">
          <label for="pipeline-provider" class="text-gray-400 font-medium">Connect Your Pipeline:</label>
          <select id="pipeline-provider" [(ngModel)]="selectedPipeline" class="select-box">
            <option>GitHub Actions</option>
            <option>GitLab CI</option>
            <option>Jenkins</option>
            <option>CircleCI</option>
          </select>
        </div>
        <div class="text-sm text-gray-400">Integration Status: <span class="text-green-400 font-semibold">Connected</span></div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <!-- Left Column -->
        <div class="lg:col-span-2 flex flex-col gap-8">
          <!-- One-Click Optimizations -->
          <div class="glass p-6 rounded-xl">
            <h3 class="text-xl font-semibold text-white mb-4">One-Click Optimizations</h3>
            <div class="flex flex-col gap-3">
              <button (click)="generateCode('Kubernetes')" class="action-button">Auto-generate Kubernetes Manifests</button>
              <button (click)="generateCode('Terraform')" class="action-button">Optimize Terraform for AWS</button>
            </div>
          </div>
          
          <!-- Deployment Flow -->
          <div class="glass p-6 rounded-xl">
            <h3 class="text-xl font-semibold text-white mb-4">Deployment Flow</h3>
            <ul class="space-y-3">
              <li *ngFor="let step of deploymentSteps" class="flex items-center justify-between step-item">
                <div class="flex items-center">
                  <div class="step-icon" [ngClass]="getStepStatusClass(step.status).iconBg">
                    <span *ngIf="step.status === 'Success'">✅</span>
                    <span *ngIf="step.status === 'In Progress'" class="spinner-sm"></span>
                    <span *ngIf="step.status === 'Pending'">⏳</span>
                    <span *ngIf="step.status === 'Failed'">❌</span>
                  </div>
                  <span class="font-medium text-white">{{ step.name }}</span>
                </div>
                <span class="text-xs text-gray-500">{{ step.timestamp }}</span>
              </li>
            </ul>
            <button (click)="triggerDeployment()" [disabled]="isDeploying" class="w-full mt-6 deploy-button">
              {{ isDeploying ? 'Deployment in Progress...' : 'Trigger Deployment' }}
            </button>
          </div>
        </div>

        <!-- Right Column -->
        <div class="lg:col-span-3 flex flex-col gap-8">
          <!-- Generated Code Preview -->
          <div class="glass p-6 rounded-xl">
            <h3 class="text-xl font-semibold text-white mb-4">Generated Code Preview <span class="text-neon-purple">({{ activeIaCProvider }})</span></h3>
            <div class="code-preview-container bg-dark-surface/70 rounded-lg">
              <pre class="a-custom-scrollbar p-4 text-sm"><code class="language-yaml">{{ generatedCode }}</code></pre>
            </div>
          </div>

          <!-- Live Environment -->
          <div class="glass p-6 rounded-xl">
            <h3 class="text-xl font-semibold text-white mb-4">Live Environment <span class="text-xs text-green-400">(us-east-1)</span></h3>
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-gray-700">
                  <th class="pb-2 text-gray-400 font-medium">Service</th>
                  <th class="pb-2 text-gray-400 font-medium">Status</th>
                  <th class="pb-2 text-gray-400 font-medium">Replicas</th>
                  <th class="pb-2 text-gray-400 font-medium">CPU/Mem</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let service of liveServices" class="border-b border-gray-800/50">
                  <td class="py-2 text-white font-semibold">{{ service.name }}</td>
                  <td class="py-2 text-green-400">{{ service.status }}</td>
                  <td class="py-2 text-gray-300">{{ service.replicas }}</td>
                  <td class="py-2 text-gray-300">{{ service.resources }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .select-box { @apply bg-dark-surface/50 text-white border border-neon-purple/50 rounded-lg px-3 py-1.5 focus:border-neon-purple focus:ring-neon-purple; }
    .action-button { @apply w-full text-left px-4 py-3 rounded-lg bg-dark-surface/50 text-white font-semibold border border-neon-purple/30 hover:bg-neon-purple/30 transition-all; }
    .deploy-button { @apply px-6 py-2 bg-gradient-to-r from-neon-purple to-electric-blue text-white font-medium rounded-lg border border-neon-purple hover:border-highlight transition-all duration-300 disabled:opacity-60; }
    .step-icon { @apply w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3; }
    .code-preview-container { height: 250px; overflow: auto; }
    .spinner-sm { 
      border: 2px solid rgba(255,255,255,0.3);
      border-left-color: #fff;
      border-radius: 50%;
      width: 1rem;
      height: 1rem;
      animation: spin 0.8s linear infinite;
    }
    .a-custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .a-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .a-custom-scrollbar::-webkit-scrollbar-thumb { background-color: #8E2DE2; border-radius: 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class DevOpsComponent implements AfterViewInit {
  selectedPipeline = 'GitHub Actions';
  isDeploying = false;
  
  deploymentSteps: DeploymentStep[] = [
    { name: 'Build Application', status: 'Pending' },
    { name: 'Run Security Lint', status: 'Pending' },
    { name: 'Optimize Infrastructure', status: 'Pending' },
    { name: 'Deploy to Staging', status: 'Pending' }
  ];

  liveServices = [
    { name: 'api-gateway', status: 'Running', replicas: '3/3', resources: '0.2/256Mi' },
    { name: 'auth-service', status: 'Running', replicas: '2/2', resources: '0.1/128Mi' },
    { name: 'user-database', status: 'Running', replicas: '1/1', resources: '0.5/1Gi' }
  ];

  activeIaCProvider: IaCProvider = 'Kubernetes';
  generatedCode = '';

  kubernetesManifest = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app-image:latest
        ports:
        - containerPort: 8080
`;

  terraformConfig = `
provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "app_server" {
  ami           = "ami-0c55b159cbfafe1f0" # Amazon Linux 2
  instance_type = "t3.micro" # Cost-optimized choice

  tags = {
    Name = "My-App-Server"
  }
}
`;

  ngAfterViewInit() {
    this.generateCode('Kubernetes'); // Default view
    gsap.from('.glass', {
      duration: 0.8,
      y: 30,
      opacity: 0,
      stagger: 0.1,
      ease: 'power3.out',
    });
  }

  generateCode(provider: IaCProvider) {
    this.activeIaCProvider = provider;
    this.generatedCode = provider === 'Kubernetes' ? this.kubernetesManifest : this.terraformConfig;
  }

  triggerDeployment() {
    if (this.isDeploying) return;
    this.isDeploying = true;
    
    // Reset steps
    this.deploymentSteps.forEach(step => {
      step.status = 'Pending';
      step.timestamp = undefined;
    });

    let delay = 0;
    this.deploymentSteps.forEach((step, index) => {
      delay += 1500; // 1.5s per step
      setTimeout(() => {
        // Mark previous step as success
        if (index > 0) {
          this.deploymentSteps[index - 1].status = 'Success';
        }
        // Mark current step as in progress
        step.status = 'In Progress';
        step.timestamp = new Date().toLocaleTimeString();

        // Final step
        if (index === this.deploymentSteps.length - 1) {
          setTimeout(() => {
            step.status = 'Success';
            this.isDeploying = false;
          }, 1500);
        }
      }, delay);
    });
  }

  getStepStatusClass(status: DeploymentStep['status']): { iconBg: string } {
    switch (status) {
      case 'Success': return { iconBg: 'bg-green-500/80' };
      case 'In Progress': return { iconBg: 'bg-blue-500/80' };
      case 'Failed': return { iconBg: 'bg-red-500/80' };
      default: return { iconBg: 'bg-gray-600' };
    }
  }
} 