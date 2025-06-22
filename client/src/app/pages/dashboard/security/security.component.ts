import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

// Define the structure for a security finding
interface SecurityFinding {
  id: string;
  title: string;
  severity: 'High' | 'Medium' | 'Low';
  category: 'IAM' | 'Data Security' | 'Networking' | 'Compliance';
  description: string;
  suggestion: string;
  complianceTags: ('SOC 2' | 'HIPAA' | 'GDPR')[];
  status: 'Open' | 'Resolved';
}

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-white mb-6">Security & Compliance</h2>
      
      <!-- Action Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <button (click)="runScan()" [disabled]="isScanning" class="action-button bg-neon-purple hover:bg-neon-purple/80 disabled:opacity-50 disabled:cursor-wait">
            <span *ngIf="!isScanning">Run New Scan</span>
            <span *ngIf="isScanning">Scanning...</span>
          </button>
        </div>
        <button (click)="downloadReport()" class="action-button bg-blue-600 hover:bg-blue-700">Download Audit Report (PDF)</button>
      </div>

      <!-- Scan Summary -->
      <div *ngIf="!isScanning && findings.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 summary-cards">
        <div class="summary-card glass bg-red-500/20 border-red-500/50">
          <h3 class="text-3xl font-bold text-white">{{ getSeverityCount('High') }}</h3>
          <p class="text-red-300">High-Risk Vulnerabilities</p>
        </div>
        <div class="summary-card glass bg-yellow-500/20 border-yellow-500/50">
          <h3 class="text-3xl font-bold text-white">{{ getSeverityCount('Medium') }}</h3>
          <p class="text-yellow-300">Medium-Risk Vulnerabilities</p>
        </div>
        <div class="summary-card glass bg-green-500/20 border-green-500/50">
          <h3 class="text-3xl font-bold text-white">{{ getSeverityCount('Low') }}</h3>
          <p class="text-green-300">Low-Risk Vulnerabilities</p>
        </div>
      </div>
      
      <!-- Findings Table -->
      <div *ngIf="!isScanning" class="glass p-6 rounded-xl findings-list">
        <h3 class="text-xl font-semibold text-white mb-4">Security Scan Results</h3>
        <p class="text-xs text-gray-400 mb-4">Last scan: {{ lastScanDate | date:'medium' }}</p>
        
        <div *ngIf="findings.length === 0" class="text-center py-8">
          <p class="text-gray-400">No security issues found. Run a scan to check your infrastructure.</p>
        </div>

        <ul *ngIf="findings.length > 0" class="space-y-4">
          <li *ngFor="let finding of findings" class="p-4 rounded-lg border" [ngClass]="getSeverityClass(finding.severity).border">
            <div class="flex justify-between items-start">
              <div>
                <span class="font-bold text-sm px-2 py-1 rounded-full" [ngClass]="getSeverityClass(finding.severity).bg">
                  {{ finding.severity }}
                </span>
                <h4 class="text-lg font-semibold text-white mt-2">{{ finding.title }}</h4>
                <p class="text-sm text-gray-400">{{ finding.description }}</p>
              </div>
              <div class="text-right flex-shrink-0 ml-4">
                <span class="text-xs text-gray-500">{{ finding.category }}</span>
                <div class="flex gap-1 mt-2">
                  <span *ngFor="let tag of finding.complianceTags" class="compliance-tag">{{ tag }}</span>
                </div>
              </div>
            </div>
            <div class="mt-4 p-3 rounded-md bg-dark-surface/50 suggestion-box">
              <p class="text-sm font-semibold text-neon-purple mb-1">Suggested Fix:</p>
              <p class="text-sm text-gray-300 font-mono">{{ finding.suggestion }}</p>
            </div>
          </li>
        </ul>
      </div>

      <!-- Scanning Loader -->
      <div *ngIf="isScanning" class="text-center p-16 glass rounded-lg">
        <div class="spinner-alt mx-auto"></div>
        <h3 class="text-2xl font-bold text-white mt-6">Running Security Scan...</h3>
        <p class="text-gray-400 mt-2">This may take a few moments...</p>
      </div>
    </div>
  `,
  styles: [`
    .action-button { @apply px-4 py-2 rounded-md font-semibold text-white transition-all; }
    .summary-card { @apply p-4 rounded-lg text-center border; }
    .compliance-tag { @apply text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded; }
    .spinner-alt {
      border: 4px solid rgba(255, 255, 255, 0.2);
      border-left-color: #A855F7; /* Neon Purple */
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class SecurityComponent implements AfterViewInit {
  isScanning = false;
  lastScanDate: Date | null = null;
  findings: SecurityFinding[] = [];

  mockFindings: SecurityFinding[] = [
    {
      id: 'vuln_01',
      title: 'Over-privileged IAM Role',
      severity: 'High',
      category: 'IAM',
      description: 'IAM role "EC2-Admin-Access" has full administrative privileges, violating the principle of least privilege.',
      suggestion: 'Restrict permissions for role "EC2-Admin-Access" to only the necessary EC2 actions.',
      complianceTags: ['SOC 2'],
      status: 'Open'
    },
    {
      id: 'vuln_02',
      title: 'Unencrypted S3 Bucket',
      severity: 'High',
      category: 'Data Security',
      description: 'The S3 bucket "customer-sensitive-data" does not have server-side encryption enabled.',
      suggestion: 'Enable AES-256 encryption at rest for the "customer-sensitive-data" S3 bucket.',
      complianceTags: ['HIPAA', 'GDPR'],
      status: 'Open'
    },
    {
      id: 'vuln_03',
      title: 'Missing GDPR Cookie Policy Endpoint',
      severity: 'Medium',
      category: 'Compliance',
      description: 'The main web application is missing a dedicated endpoint for managing user cookie preferences as required by GDPR.',
      suggestion: 'Create a /gdpr-cookie-policy endpoint and a corresponding UI banner for user consent.',
      complianceTags: ['GDPR'],
      status: 'Open'
    },
    {
      id: 'vuln_04',
      title: 'Publicly Exposed Database Port',
      severity: 'High',
      category: 'Networking',
      description: 'The primary PostgreSQL database on port 5432 is open to the public internet (0.0.0.0/0).',
      suggestion: 'Update the security group to restrict access to port 5432 to only whitelisted application server IPs.',
      complianceTags: ['SOC 2'],
      status: 'Open'
    },
    {
      id: 'vuln_05',
      title: 'Outdated SSH Protocol',
      severity: 'Low',
      category: 'Networking',
      description: 'The bastion host is allowing connections using older, less secure SSH-RSA keys.',
      suggestion: 'Update the SSH daemon configuration to only allow modern signature algorithms like rsa-sha2-512.',
      complianceTags: ['SOC 2'],
      status: 'Open'
    }
  ];

  ngAfterViewInit() {
    this.runScan(); // Automatically run a scan on component load
  }

  runScan() {
    this.isScanning = true;
    this.findings = [];
    gsap.from('.spinner-alt', { duration: 0.5, scale: 0.5, opacity: 0 });

    // Simulate a network delay for the scan
    setTimeout(() => {
      this.findings = this.mockFindings;
      this.lastScanDate = new Date();
      this.isScanning = false;
      
      // Animate the results appearing
      gsap.from('.summary-cards, .findings-list', {
        duration: 0.7,
        y: 40,
        opacity: 0,
        stagger: 0.2,
        ease: 'power3.out'
      });
    }, 2500);
  }

  downloadReport() {
    // In a real app, this would trigger a backend process to generate a PDF
    alert('Generating a dummy audit report... (This would be a PDF download)');
    
    const reportContent = `
      Security Audit Report
      =====================
      Date: ${new Date().toUTCString()}
      Compliance Score: 85% (Calculated)
      
      Findings Summary:
      - High Risk: ${this.getSeverityCount('High')}
      - Medium Risk: ${this.getSeverityCount('Medium')}
      - Low Risk: ${this.getSeverityCount('Low')}
      
      Detailed Findings:
      ${this.findings.map(f => `
      ---
      - Title: ${f.title}
      - Severity: ${f.severity}
      - Category: ${f.category}
      - Compliance: ${f.complianceTags.join(', ')}
      - Suggestion: ${f.suggestion}
      `).join('')}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security_audit_report.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getSeverityCount(severity: 'High' | 'Medium' | 'Low'): number {
    return this.findings.filter(f => f.severity === severity).length;
  }

  getSeverityClass(severity: 'High' | 'Medium' | 'Low'): { bg: string, border: string } {
    switch (severity) {
      case 'High':
        return { bg: 'bg-red-500/80', border: 'border-red-500/50' };
      case 'Medium':
        return { bg: 'bg-yellow-500/80', border: 'border-yellow-500/50' };
      case 'Low':
        return { bg: 'bg-green-500/80', border: 'border-green-500/50' };
    }
  }
} 