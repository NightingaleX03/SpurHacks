import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../services/theme.service';
import { AuthService, User } from '../../../services/auth.service';
import { EnterpriseService, DiagramResource, EnterpriseUser } from '../../../services/enterprise.service';
import { UserDiagramService, UserDiagram } from '../../../services/user-diagram.service';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';

declare var mermaid: any;

@Component({
  selector: 'app-diagrams',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SafeHtmlPipe],
  template: `
    <div class="container mx-auto p-4 md:p-8">
      <!-- List View -->
      <ng-container *ngIf="viewMode === 'list'">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-4xl font-bold text-white">Your Diagrams</h1>
          <button (click)="showCreateView()" [disabled]="!canGenerateDiagrams" class="generate-button">
            Create New Diagram
          </button>
        </div>
        <div class="mb-6">
          <input
            type="text"
            placeholder="Search diagrams by title..."
            class="w-full p-3 rounded-lg bg-dark-surface/50 text-white border border-neon-purple/50 focus:border-neon-purple focus:ring-neon-purple"
            [(ngModel)]="searchTerm"
            (input)="filterDiagrams()"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let diagram of filteredDiagrams" class="glass p-4 rounded-lg flex flex-col justify-between">
            <div>
              <h3 class="text-xl font-semibold text-white mb-2">{{ diagram.name }}</h3>
              <p class="text-gray-400 text-sm mb-4">{{ diagram.description }}</p>
            </div>
            <button (click)="viewDiagram(diagram)" class="action-button self-end">View Diagram</button>
          </div>
          <div *ngIf="filteredDiagrams.length === 0" class="text-center col-span-full py-8">
            <p class="text-gray-400">No diagrams found.</p>
          </div>
        </div>
      </ng-container>

      <!-- Create/Preview View -->
      <ng-container *ngIf="viewMode === 'create'">
        <!-- Generator View -->
        <div *ngIf="!mermaidCode">
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-white mb-2">Architecture Diagrams</h1>
            <p class="text-gray-400 max-w-2xl mx-auto">
              Enter a prompt describing the system or process you want to visualize, then select a diagram type below to generate it.
            </p>
          </div>
          <div class="max-w-4xl mx-auto">
            <div class="mb-6">
              <textarea
                class="w-full h-32 p-4 rounded-lg bg-dark-surface/50 text-white border border-neon-purple/50 focus:border-neon-purple focus:ring-neon-purple transition-all duration-300 placeholder-gray-500"
                placeholder="e.g., 'Design a login system with a front-end client, a back-end authentication service, and a user database.'"
                [(ngModel)]="prompt"
              ></textarea>
            </div>
            <div class="mb-6">
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-center">
                <button
                  *ngFor="let type of diagramTypes"
                  (click)="selectDiagramType(type)"
                  [class.selected]="selectedDiagramType === type"
                  class="diagram-type-button"
                >
                  {{ type }}
                </button>
              </div>
            </div>
            <div class="text-center">
              <button
                (click)="generateDiagram()"
                [disabled]="!prompt || !selectedDiagramType || isLoading"
                class="generate-button"
              >
                <span *ngIf="!isLoading">Generate Diagram</span>
                <span *ngIf="isLoading" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              </button>
              <button (click)="showListView()" class="ml-4 action-button">Cancel</button>
              <button (click)="testMermaidRendering()" class="ml-4 action-button">Test Rendering</button>
            </div>
          </div>
        </div>
        
        <!-- Diagram and Chat View -->
        <div *ngIf="mermaidCode" class="mt-8">
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <!-- Left side (diagram) -->
                <div class="lg:col-span-3">
                    <div class="flex justify-between items-center mb-4">
                        <h1 class="text-3xl font-bold text-white">{{ selectedDiagram.name || 'Diagram Preview' }}</h1>
                        <button (click)="showListView()" class="action-button">Go back to designs</button>
                    </div>
                    <div class="p-4 bg-gray-900 rounded-lg shadow-lg mb-4">
                        <h3 class="text-xl font-semibold text-white mb-4">Generated Mermaid Code</h3>
                        <pre class="bg-gray-800 p-4 rounded-md overflow-x-auto text-sm"><code class="text-green-300">{{ mermaidCode }}</code></pre>
                        <div class="flex justify-end space-x-2 mt-4">
                            <button (click)="copyToClipboard()" class="action-button">Copy</button>
                            <button (click)="downloadDiagram('png')" class="action-button">Download PNG</button>
                            <button (click)="downloadDiagram('svg')" class="action-button">Download SVG</button>
                        </div>
                    </div>
                    <div class="p-4 bg-white rounded-lg shadow-lg">
                        <div *ngIf="svg" [innerHTML]="svg | safeHtml"></div>
                        <div *ngIf="!svg && mermaidCode" class="text-center text-gray-500">
                            Rendering diagram...
                        </div>
                    </div>
                </div>

                <!-- Right side (chat + share) -->
                <div class="lg:col-span-2">
                    <!-- Share section -->
                    <div *ngIf="isEmployee" class="glass p-4 rounded-lg mb-6">
                        <h3 class="text-xl font-semibold text-white mb-4">Share Diagram</h3>
                        <div class="flex flex-col space-y-2">
                            <label *ngFor="let emp of companyEmployees" class="flex items-center">
                                <input type="checkbox" 
                                       [checked]="isSharedWith(emp.id)"
                                       (change)="toggleShare(emp.id, $event)"
                                       class="form-checkbox h-5 w-5 text-neon-purple bg-gray-800 border-gray-600 rounded focus:ring-neon-purple">
                                <span class="ml-2 text-white">{{ emp.name }}</span>
                                <span class="ml-2 text-xs text-gray-400">{{ emp.email }}</span>
                            </label>
                        </div>
                    </div>

                    <!-- Chatbot section -->
                    <div class="glass p-4 rounded-lg">
                        <h3 class="text-xl font-semibold text-white mb-4">Chat with Diagram AI</h3>
                        <div #chatContainer class="h-64 overflow-y-auto bg-dark-surface/50 rounded-lg p-2 mb-4 flex flex-col space-y-2">
                            <div *ngFor="let msg of chatHistory" class="chat-message" [class.user]="msg.author === 'user'" [class.bot]="msg.author === 'bot'">
                                <p>{{ msg.message }}</p>
                            </div>
                        </div>
                        <form (ngSubmit)="sendChatMessage()" class="flex gap-2">
                            <input [(ngModel)]="chatInput" name="chatInput"
                                   placeholder="Ask about your diagram..."
                                   class="flex-grow p-2 rounded bg-dark-surface/50 text-white border border-neon-purple/30">
                            <button type="submit" class="action-button">Send</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <div *ngIf="errorMessage" class="mt-8 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300">
          <h3 class="font-bold">Error</h3>
          <p>{{ errorMessage }}</p>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .diagram-type-button { @apply px-4 py-2 rounded-lg bg-dark-surface/50 text-white border border-neon-purple/30 hover:bg-neon-purple/30 transition-all duration-200; }
    .diagram-type-button.selected { @apply bg-neon-purple text-white border-neon-purple; box-shadow: 0 0 8px theme('colors.neon-purple'); }
    .generate-button { @apply px-8 py-3 rounded-lg bg-gradient-to-r from-neon-purple to-electric-blue text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300; }
    .action-button { @apply px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors; }
    .chat-message { @apply p-2 rounded-lg max-w-xs; }
    .chat-message.user { @apply bg-electric-blue text-white self-end; }
    .chat-message.bot { @apply bg-gray-700 text-white self-start; }
  `],
})
export class DiagramsComponent implements OnInit, OnDestroy, AfterViewChecked {
  viewMode: 'list' | 'create' = 'list';
  prompt = '';
  diagramTypes = ['Class Diagram', 'Object Diagram', 'Component Diagram', 'Deployment Diagram', 'Package Diagram', 'State Machine Diagram', 'Activity Diagram', 'Use Case Diagram', 'Sequence Diagram', 'Communication Diagram', 'Interaction Overview', 'UML'];
  selectedDiagramType: string | null = null;
  mermaidCode = '';
  svg: string | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  allDiagrams: (DiagramResource | UserDiagram)[] = [];
  filteredDiagrams: (DiagramResource | UserDiagram)[] = [];
  searchTerm = '';
  selectedDiagram: Partial<DiagramResource | UserDiagram> = {};

  currentUser: EnterpriseUser | User | null = null;
  canGenerateDiagrams = false;
  canViewDiagrams = false;
  isEmployee = false;
  companyEmployees: EnterpriseUser[] = [];
  chatHistory: { author: 'user' | 'bot'; message: string }[] = [];
  chatInput = '';

  private themeSubscription!: Subscription;
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  constructor(
    private http: HttpClient,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private enterpriseService: EnterpriseService,
    private userDiagramService: UserDiagramService
  ) {}

  ngOnInit(): void {
    // Initialize Mermaid
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose'
      });
    }

    this.themeSubscription = this.themeService.theme$.subscribe((theme: 'light' | 'dark') => {
      // Theme change logic if needed
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.setPermissions();
      this.loadDiagrams();
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch(err) { 
        console.error("Could not scroll to bottom:", err);
    }
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) this.themeSubscription.unsubscribe();
  }

  setPermissions() {
    this.isEmployee = this.enterpriseService.isEmployee();
    if (this.currentUser && 'permissions' in this.currentUser) {
      this.canViewDiagrams = this.currentUser.permissions.canViewDiagrams;
      this.canGenerateDiagrams = this.currentUser.permissions.canGenerateDiagrams;
    } else { // regular user
      this.canViewDiagrams = true;
      this.canGenerateDiagrams = true;
    }
  }

  loadDiagrams() {
    if (this.currentUser && 'company_id' in this.currentUser) {
      if (this.enterpriseService.isEnterpriseEmployer()) {
        this.allDiagrams = this.enterpriseService.getCompanyDiagrams();
      } else {
        this.allDiagrams = this.enterpriseService.getCompanyDiagrams().filter(
          (d: DiagramResource) => d.permissions.canView.includes(this.currentUser!.id)
        );
      }
      this.filterDiagrams();
    } else {
      this.userDiagramService.getUserDiagrams().subscribe(diagrams => {
        this.allDiagrams = diagrams;
        this.filterDiagrams();
      });
    }
  }

  filterDiagrams() {
    if (!this.searchTerm) {
      this.filteredDiagrams = this.allDiagrams;
    } else {
      this.filteredDiagrams = this.allDiagrams.filter(d =>
        d.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  isDiagramResource(diagram: any): diagram is DiagramResource {
    return 'permissions' in diagram;
  }

  loadCompanyEmployees() {
    this.companyEmployees = this.enterpriseService.getCompanyEmployees()
      .filter(emp => emp.id !== this.currentUser?.id);
  }

  isSharedWith(employeeId: string): boolean {
    if (this.isDiagramResource(this.selectedDiagram)) {
      return this.selectedDiagram.permissions?.canView.includes(employeeId) ?? false;
    }
    return false;
  }

  toggleShare(employeeId: string, event: Event) {
    if (!this.isDiagramResource(this.selectedDiagram) || !this.selectedDiagram.id || !this.selectedDiagram.permissions) return;

    const checked = (event.target as HTMLInputElement).checked;
    const currentPermissions = { ...this.selectedDiagram.permissions };
    const canView = [...currentPermissions.canView];

    if (checked && !canView.includes(employeeId)) {
      canView.push(employeeId);
    } else if (!checked) {
      const index = canView.indexOf(employeeId);
      if (index > -1) {
        canView.splice(index, 1);
      }
    }
    
    currentPermissions.canView = canView;
    this.enterpriseService.updateDiagramPermissions(this.selectedDiagram.id, currentPermissions);
    this.selectedDiagram.permissions = currentPermissions;
  }

  sendChatMessage() {
    if (!this.chatInput.trim() || !this.mermaidCode) return;

    const userMessage = this.chatInput.trim();
    this.chatHistory.push({ author: 'user', message: userMessage });
    this.chatInput = '';
    this.cdr.detectChanges();

    // Add a "thinking" message from the bot
    this.chatHistory.push({ author: 'bot', message: 'Thinking...' });
    this.cdr.detectChanges();

    const payload = {
      message: userMessage,
      context: this.mermaidCode
    };

    this.http.post<{reply: string}>('http://localhost:8000/api/diagrams/chat', payload)
      .subscribe({
        next: (data) => {
          // Remove "Thinking..." message
          this.chatHistory.pop();
          // Add the real response
          this.chatHistory.push({ author: 'bot', message: data.reply });
          this.cdr.detectChanges();
        },
        error: (error) => {
          // Remove "Thinking..." message
          this.chatHistory.pop();
          console.error('Error from chatbot:', error);
          const errorMessage = `Sorry, I encountered an error: ${error.error?.detail || error.message}`;
          this.chatHistory.push({ author: 'bot', message: errorMessage });
          this.cdr.detectChanges();
        },
      });
  }

  showListView() {
    this.viewMode = 'list';
    this.resetGenerator();
    this.loadDiagrams();
  }

  showCreateView() {
    if (!this.canGenerateDiagrams) return;
    this.viewMode = 'create';
    this.resetGenerator();
  }

  viewDiagram(diagram: DiagramResource | UserDiagram) {
    this.selectedDiagram = diagram;
    this.mermaidCode = diagram.mermaid_code || 'graph TD;\\n    A[Start] --> B{Is it?};\\n    B -->|Yes| C[OK];\\n    C --> D[End];\\n    B -->|No| E[Don\'t!];\\n    E --> D;'; // Provide a default diagram
    this.renderMermaid();
    this.viewMode = 'create';
    if (this.isEmployee) {
      this.loadCompanyEmployees();
    }
    this.chatHistory = [{ author: 'bot', message: `Hello! You are viewing '${diagram.name}'. How can I help you with this diagram?` }];
  }

  selectDiagramType(type: string) {
    this.selectedDiagramType = type;
  }

  generateDiagram() {
    if (!this.prompt || !this.selectedDiagramType) {
      this.errorMessage = 'Please enter a prompt and select a diagram type.';
      return;
    }
    this.isLoading = true;
    this.mermaidCode = '';
    this.errorMessage = null;

    this.http.post<any>('http://localhost:8000/api/diagrams/generate', { prompt: this.prompt, diagram_type: this.selectedDiagramType })
      .subscribe({
        next: (data) => {
          this.mermaidCode = data.mermaid_code;
          this.renderMermaid();
          this.isLoading = false;
          this.saveDiagram(this.mermaidCode, this.prompt);
          if (this.isEmployee) this.loadCompanyEmployees();
        },
        error: (error) => {
          console.error('Error generating diagram:', error);
          this.errorMessage = `An error occurred while generating the diagram: ${error.error?.detail || error.message}`;
          this.isLoading = false;
        },
      });
  }
  
  saveDiagram(mermaidCode: string, prompt: string) {
    if (this.currentUser && 'company_id' in this.currentUser) {
      const companyId = (this.currentUser as EnterpriseUser).company_id;
      
      const canView = [this.currentUser!.id];
      const canEdit = [this.currentUser!.id];
      const canShare: string[] = [];

      if (this.isEmployee) {
        const employer = this.enterpriseService.getCompanyEmployer(companyId);
        if (employer) {
          canView.push(employer.id);
          canEdit.push(employer.id);
          canShare.push(employer.id);
        }
      }

      const newDiagram: DiagramResource = {
        id: `diag_${Date.now()}`,
        name: prompt.substring(0, 30) + '...',
        description: `Generated from prompt: "${prompt}"`,
        type: this.selectedDiagramType!,
        company_id: companyId,
        created_by: this.currentUser!.id,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        access_level: 'shared',
        shared_with: canView,
        mermaid_code: mermaidCode,
        permissions: { 
          canView: canView,
          canEdit: canEdit,
          canShare: canShare
        }
      };
      this.enterpriseService.addDiagram(newDiagram);
      this.selectedDiagram = newDiagram;
    } else {
      const newDiagram: UserDiagram = {
        id: `diag_${Date.now()}`,
        name: prompt.substring(0, 30) + '...',
        description: `Generated from prompt: "${prompt}"`,
        type: this.selectedDiagramType!,
        mermaid_code: mermaidCode
      };
      this.userDiagramService.addDiagram(newDiagram);
      this.selectedDiagram = newDiagram;
    }
  }

  resetGenerator() {
    this.prompt = '';
    this.selectedDiagramType = null;
    this.mermaidCode = '';
    this.svg = null;
    this.errorMessage = null;
    this.selectedDiagram = {};
    this.chatHistory = [];
  }

  renderMermaid() {
    if (this.mermaidCode) {
      try {
        // Clean up code (replace \n with real newlines)
        const cleanCode = this.mermaidCode.replace(/\\n/g, '\n');
        
        // Use mermaid.render with a unique ID and get the SVG as a string
        mermaid.render('mermaid-preview-' + Date.now(), cleanCode).then(({ svg }: { svg: string }) => {
          this.svg = svg;
          this.cdr.detectChanges();
        }).catch((error: any) => {
          console.error('Mermaid rendering error:', error);
          this.errorMessage = 'There was an error rendering the diagram. The generated code might be invalid.';
          this.cdr.detectChanges();
        });
      } catch (e) {
        console.error('Mermaid rendering error:', e);
        this.errorMessage = 'There was an error rendering the diagram. The generated code might be invalid.';
        this.cdr.detectChanges();
      }
    }
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.mermaidCode);
  }

  downloadDiagram(format: 'png' | 'svg') {
    if (!this.svg) return;
    
    if (format === 'svg') {
      const blob = new Blob([this.svg], { type: 'image/svg+xml' });
      this.downloadBlob(blob, `${this.selectedDiagram.name || 'diagram'}.svg`);
    } else if (format === 'png') {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) this.downloadBlob(blob, `${this.selectedDiagram.name || 'diagram'}.png`);
          });
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(this.svg);
      }
    }
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  testMermaidRendering() {
    console.log('Testing Mermaid rendering...');
    this.http.get<any>('http://localhost:8000/api/diagrams/test')
      .subscribe({
        next: (data) => {
          console.log('Test diagram received:', data);
          this.mermaidCode = data.mermaid_code;
          this.renderMermaid();
        },
        error: (error) => {
          console.error('Error testing diagram:', error);
          this.errorMessage = 'Error testing diagram rendering.';
        },
      });
  }
}
