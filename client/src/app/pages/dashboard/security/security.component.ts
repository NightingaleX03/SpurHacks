import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

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

interface SecurityProfile {
  user_id: string;
  name: string;
  company: string;
  role: string;
  industry: string;
  compliance_score: number;
  last_scan: string;
  findings: SecurityFinding[];
  compliance_requirements: string[];
  industry_specific: string;
}

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-white mb-6">Security & Compliance</h2>
      
      <!-- User Profile Info -->
      <div *ngIf="securityProfile" class="glass p-4 rounded-lg mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-semibold text-white">{{ securityProfile.name }} - {{ securityProfile.role }}</h3>
            <p class="text-gray-400">{{ securityProfile.company }} ({{ securityProfile.industry }})</p>
            <p class="text-sm text-gray-500">Industry Focus: {{ securityProfile.industry_specific }}</p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-neon-purple">{{ securityProfile.compliance_score }}%</div>
            <div class="text-sm text-gray-400">Compliance Score</div>
          </div>
        </div>
        <div class="mt-3 flex gap-2">
          <span *ngFor="let req of securityProfile.compliance_requirements" class="compliance-tag">{{ req }}</span>
        </div>
      </div>
      
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
  securityProfile: SecurityProfile | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngAfterViewInit() {
    this.loadSecurityProfile();
    this.runScan(); // Automatically run a scan on component load
  }

  private loadSecurityProfile() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No current user found');
      return;
    }

    this.http.get<any>('assets/data/security-profiles.json').subscribe({
      next: (data) => {
        const userProfile = data.security_profiles[currentUser.id];
        if (userProfile) {
          this.securityProfile = userProfile;
          console.log('Loaded security profile for:', userProfile.name);
        } else {
          console.warn('No security profile found for user:', currentUser.id);
          // Fallback to default profile
          this.securityProfile = {
            user_id: currentUser.id,
            name: currentUser.name,
            company: 'Unknown',
            role: currentUser.role,
            industry: 'Unknown',
            compliance_score: 50,
            last_scan: new Date().toISOString(),
            findings: [],
            compliance_requirements: [],
            industry_specific: 'General'
          };
        }
      },
      error: (error) => {
        console.error('Error loading security profiles:', error);
      }
    });
  }

  runScan() {
    this.isScanning = true;
    this.findings = [];
    gsap.from('.spinner-alt', { duration: 0.5, scale: 0.5, opacity: 0 });

    // Simulate a network delay for the scan
    setTimeout(() => {
      if (this.securityProfile) {
        this.findings = this.securityProfile.findings;
        this.lastScanDate = new Date(this.securityProfile.last_scan);
      } else {
        // Fallback to empty findings if no profile loaded
        this.findings = [];
        this.lastScanDate = new Date();
      }
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
      User: ${this.securityProfile?.name || 'Unknown'}
      Company: ${this.securityProfile?.company || 'Unknown'}
      Compliance Score: ${this.securityProfile?.compliance_score || 0}%
      
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