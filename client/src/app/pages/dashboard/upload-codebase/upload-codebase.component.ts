import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { gsap } from 'gsap';
import { EnterpriseService } from '../../../services/enterprise.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CodebaseService, SavedCodebase, SharedCodebase } from '../../../services/codebase.service';
import { AuthService, User } from '../../../services/auth.service';
import { Observable, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path?: string;
  content?: string;
  children?: FileNode[];
  expanded?: boolean;
}

interface RepositoryAnalysis {
  owner: string;
  repo: string;
  file_tree: FileNode[];
  tech_stack: string[];
  repo_info: any;
  total_files: number;
}

@Component({
  selector: 'app-upload-codebase',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="container mx-auto p-4 md:p-8">
      <h2 class="text-4xl font-bold text-white mb-8">Codebase Intelligence</h2>

      <!-- Input View -->
      <ng-container *ngIf="viewMode === 'input'">
        <!-- Loading Screen -->
        <div *ngIf="isLoading" class="text-center p-16 glass rounded-lg">
            <div class="spinner-alt mx-auto"></div>
            <h3 class="text-2xl font-bold text-white mt-6">Analyzing Repository...</h3>
            <p class="text-gray-400 mt-2">Please wait while we fetch and process the codebase.</p>
        </div>

        <!-- Main Input Content -->
        <ng-container *ngIf="!isLoading">
            <p class="text-gray-400 mb-6 max-w-2xl">
              Enter a public GitHub repository URL to analyze its structure, ask questions, and automatically generate architecture diagrams.
            </p>
            <form (ngSubmit)="loadRepo()" class="flex items-center gap-4">
              <input 
                type="text" 
                [(ngModel)]="repoUrl" 
                name="repoUrl"
                placeholder="e.g., https://github.com/owner/repo-name"
                class="w-full md:w-1/2 p-3 rounded-lg bg-dark-surface/50 text-white border border-neon-purple/50 focus:border-neon-purple focus:ring-neon-purple"
                required
              >
              <button type="submit" [disabled]="!repoUrl" class="generate-button">Analyze Repository</button>
            </form>

            <!-- Saved Codebases -->
            <div *ngIf="(savedCodebases$ | async)?.length" class="mt-12">
                <h3 class="text-2xl font-bold text-white mb-4">Saved Codebases</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div *ngFor="let codebase of (savedCodebases$ | async)" class="glass p-4 rounded-lg flex flex-col justify-between">
                        <div>
                            <h4 class="text-lg font-semibold text-neon-purple">{{ codebase.owner }}/{{ codebase.repo }}</h4>
                            <p class="text-sm text-gray-400">Saved on: {{ codebase.savedAt | date:'short' }}</p>
                            <p class="text-sm text-gray-400">{{ codebase.total_files }} files</p>
                        </div>
                        <div class="flex gap-2 mt-4">
                            <button (click)="loadSavedCodebase(codebase)" class="flex-grow action-button">Load</button>
                            <button *ngIf="canDeleteCodebases" (click)="deleteCodebase(codebase.id)" class="action-button bg-red-800/50 hover:bg-red-800/80">Delete</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Shared Codebases -->
            <div *ngIf="(sharedCodebases$ | async)?.length" class="mt-12">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-2xl font-bold text-white">Shared Codebases</h3>
                    <button (click)="refreshSharedCodebases()" class="action-button bg-blue-600 hover:bg-blue-700">Refresh</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div *ngFor="let codebase of (sharedCodebases$ | async)" class="glass p-4 rounded-lg flex flex-col justify-between">
                        <div>
                            <h4 class="text-lg font-semibold text-neon-purple">{{ codebase.name }}</h4>
                            <p *ngIf="codebase.description" class="text-sm text-gray-400">{{ codebase.description }}</p>
                            <p class="text-sm text-gray-400">Shared by: {{ codebase.owner_email }}</p>
                            <p class="text-sm text-gray-400">Created: {{ codebase.created_at | date:'short' }}</p>
                            <p class="text-sm text-gray-400">{{ codebase.total_files }} files</p>
                            <span *ngIf="codebase.is_public" class="inline-block px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">Public</span>
                        </div>
                        <div class="flex gap-2 mt-4">
                            <button (click)="loadSharedCodebase(codebase)" class="flex-grow action-button">Load</button>
                            <button *ngIf="isEmployer || codebase.owner_email === (authService.getCurrentUser()?.email)" 
                                    (click)="openPermissionDialog(codebase.id)" 
                                    class="action-button bg-blue-600/50 hover:bg-blue-600/80">Manage Access</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- No Shared Codebases Message -->
            <div *ngIf="!(sharedCodebases$ | async)?.length" class="mt-12">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-2xl font-bold text-white">Shared Codebases</h3>
                    <button (click)="refreshSharedCodebases()" class="action-button bg-blue-600 hover:bg-blue-700">Refresh</button>
                </div>
                <div class="glass p-8 rounded-lg text-center">
                    <p class="text-gray-400 mb-4">No shared codebases found.</p>
                    <p class="text-sm text-gray-500">Codebases shared by your organization will appear here.</p>
                </div>
            </div>
        </ng-container>
      </ng-container>

      <!-- Viewer View -->
      <ng-container *ngIf="viewMode === 'viewer'">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-white">Repository: <span class="text-neon-purple">{{ repoName }}</span></h3>
            <div class="flex gap-4">
                <button (click)="openShareDialog()" class="action-button bg-green-600 hover:bg-green-700">Share Codebase</button>
                <button (click)="saveCurrentCodebase()" class="action-button bg-neon-purple hover:bg-neon-purple/80">Save Codebase</button>
                <button (click)="resetView()" class="action-button">Analyze another repo</button>
            </div>
        </div>

        <!-- VS Code-like Environment -->
        <div class="glass rounded-lg flex code-editor-container overflow-hidden border border-neon-purple/20">
            <!-- File Explorer -->
            <div class="w-1/3 p-4 border-r border-neon-purple/20 overflow-y-auto a-custom-scrollbar">
                <h4 class="text-lg font-semibold text-white mb-4">File Explorer</h4>
                <ng-template #fileTree let-files let-level="level">
                  <ul class="text-gray-300 space-y-1" [style.padding-left.rem]="level > 0 ? 1 : 0">
                      <li *ngFor="let file of files">
                          <div (click)="toggleNode(file)"
                              class="flex items-center cursor-pointer hover:bg-neon-purple/10 transition-colors p-1 rounded"
                              [class.active-file]="selectedFile?.name === file.name && file.type === 'file'">
                              <span class="mr-2 text-lg w-6 text-center">
                                <ng-container *ngIf="file.type === 'folder'">{{ file.expanded ? '📂' : '📁' }}</ng-container>
                                <ng-container *ngIf="file.type === 'file'">📄</ng-container>
                              </span>
                              {{ file.name }}
                          </div>
                          <div *ngIf="file.expanded && file.children && file.children.length > 0">
                              <ng-container *ngTemplateOutlet="fileTree; context: { $implicit: file.children, level: level + 1 }"></ng-container>
                          </div>
                      </li>
                  </ul>
                </ng-template>
                <ng-container *ngTemplateOutlet="fileTree; context: { $implicit: repoFiles, level: 0 }"></ng-container>
            </div>
            <!-- Code Editor -->
            <div class="w-2/3 flex flex-col bg-dark-surface/50">
                <!-- File Header -->
                <div class="p-3 border-b border-neon-purple/20 bg-dark-surface/70">
                    <h5 class="text-sm font-medium text-white">
                        {{ selectedFile?.name || 'No file selected' }}
                    </h5>
                </div>
                <!-- Code Content -->
                <div class="code-content">
                    <pre class="h-full overflow-auto text-sm a-custom-scrollbar p-4 m-0"><code class="text-white language-typescript">{{ selectedFile?.content || 'Select a file to view its content.' }}</code></pre>
                </div>
            </div>
        </div>

        <!-- Analysis Panels -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <!-- Chat -->
            <div class="lg:col-span-2 glass p-4 rounded-lg flex flex-col">
              <h4 class="text-xl font-semibold text-white mb-4">Chat with Codebase AI</h4>
              <div class="chat-container bg-dark-surface/50 rounded-lg p-4 mb-4 flex flex-col space-y-3 a-custom-scrollbar">
                  <div *ngFor="let msg of chatHistory" class="chat-message" [class.user]="msg.author === 'user'" [class.bot]="msg.author === 'bot'">
                      <p>{{ msg.message }}</p>
                  </div>
                  <!-- Typing Animation -->
                  <div *ngIf="isTyping" class="chat-message bot typing-message">
                      <div class="typing-indicator">
                          <span class="dot"></span>
                          <span class="dot"></span>
                          <span class="dot"></span>
                      </div>
                  </div>
              </div>
              <form (ngSubmit)="sendChatMessage()" class="flex gap-2">
                  <input [(ngModel)]="chatInput" name="chatInput" placeholder="e.g., 'Explain the auth service...'" class="flex-grow p-2 rounded bg-dark-surface/50 text-white border border-neon-purple/30">
                  <button type="submit" [disabled]="isTyping" class="action-button">Send</button>
              </form>
            </div>
            
            <!-- Right Column Panels -->
            <div class="flex flex-col gap-8">
                <!-- Tech Stack -->
                <div class="glass p-4 rounded-lg">
                    <h4 class="text-xl font-semibold text-white mb-4">Tech Stack</h4>
                    <div class="flex flex-wrap gap-2">
                        <span *ngFor="let tech of techStack" class="px-2 py-1 bg-dark-surface/50 text-white rounded text-sm font-medium border border-neon-purple/30">
                            {{ tech }}
                        </span>
                    </div>
                </div>
                <!-- Diagram Gen -->
                <div class="glass p-4 rounded-lg">
                    <h4 class="text-xl font-semibold text-white mb-4">Generate Diagrams</h4>
                    <p class="text-gray-400 mb-4">Select a diagram type to automatically generate it based on '{{ repoName }}'.</p>
                    <div class="grid grid-cols-2 gap-2 text-center">
                        <button *ngFor="let type of diagramTypes" (click)="generateDiagram(type)" class="diagram-type-button">{{ type }}</button>
                    </div>
                </div>
            </div>
        </div>
      </ng-container>

      <!-- Share Dialog -->
      <div *ngIf="showShareDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="glass p-6 rounded-lg w-full max-w-md">
              <h3 class="text-xl font-bold text-white mb-4">Share Codebase</h3>
              <form (ngSubmit)="shareCodebase()" class="space-y-4">
                  <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">Name</label>
                      <input [(ngModel)]="shareName" name="shareName" type="text" 
                             class="w-full p-2 rounded bg-dark-surface/50 text-white border border-neon-purple/30"
                             placeholder="Enter codebase name" required>
                  </div>
                  <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <textarea [(ngModel)]="shareDescription" name="shareDescription" 
                                class="w-full p-2 rounded bg-dark-surface/50 text-white border border-neon-purple/30"
                                placeholder="Enter description (optional)" rows="3"></textarea>
                  </div>
                  <div class="flex items-center">
                      <input [(ngModel)]="isPublicShare" name="isPublicShare" type="checkbox" 
                             class="mr-2 rounded border-neon-purple/30">
                      <label class="text-sm text-gray-300">Make public</label>
                  </div>
                  <div class="flex gap-2">
                      <button type="submit" class="flex-1 action-button bg-green-600 hover:bg-green-700">Share</button>
                      <button type="button" (click)="closeShareDialog()" class="flex-1 action-button">Cancel</button>
                  </div>
              </form>
          </div>
      </div>

      <!-- Permission Dialog -->
      <div *ngIf="showPermissionDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="glass p-6 rounded-lg w-full max-w-md">
              <h3 class="text-xl font-bold text-white mb-4">Grant Access</h3>
              <form (ngSubmit)="grantPermission()" class="space-y-4">
                  <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">User Email</label>
                      <input [(ngModel)]="permissionUserEmail" name="permissionUserEmail" type="email" 
                             class="w-full p-2 rounded bg-dark-surface/50 text-white border border-neon-purple/30"
                             placeholder="Enter user email" required>
                  </div>
                  <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">Permission Level</label>
                      <select [(ngModel)]="permissionType" name="permissionType" 
                              class="w-full p-2 rounded bg-dark-surface/50 text-white border border-neon-purple/30">
                          <option value="read">Read Only</option>
                          <option value="write">Read & Write</option>
                          <option value="admin">Admin</option>
                      </select>
                  </div>
                  <div class="flex gap-2">
                      <button type="submit" class="flex-1 action-button bg-blue-600 hover:bg-blue-700">Grant Access</button>
                      <button type="button" (click)="closePermissionDialog()" class="flex-1 action-button">Cancel</button>
                  </div>
              </form>
          </div>
      </div>

      <div *ngIf="!canUploadCodebases" class="text-center mt-8">
        <p class="text-red-400">You do not have permission to upload or analyze codebases.</p>
      </div>
    </div>
  `,
  styles: [`
    .generate-button { @apply px-8 py-3 rounded-lg bg-gradient-to-r from-neon-purple to-electric-blue text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all; }
    .action-button { @apply px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors; }
    .diagram-type-button { @apply px-4 py-2 rounded-lg bg-dark-surface/50 text-white border border-neon-purple/30 hover:bg-neon-purple/30 transition-all; }
    .chat-message { @apply p-3 rounded-lg max-w-xs; }
    .chat-message.user { @apply bg-electric-blue text-white self-end; }
    .chat-message.bot { @apply bg-gray-700 text-white self-start; }
    .active-file { @apply text-neon-purple bg-neon-purple/10; }
    
    /* Fixed height chat container */
    .chat-container {
      height: 400px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    
    /* Code editor fixed dimensions */
    .code-editor-container {
      height: 600px;
      min-height: 600px;
      max-height: 600px;
    }
    
    .code-content {
      height: calc(100% - 50px); /* Subtract header height */
      overflow: auto;
    }
    
    /* Typing animation styles */
    .typing-message {
      background: rgba(55, 65, 81, 0.8) !important;
      border: 1px solid rgba(139, 92, 246, 0.3);
    }
    
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
    }
    
    .typing-indicator .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #A855F7;
      animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-indicator .dot:nth-child(1) {
      animation-delay: -0.32s;
    }
    
    .typing-indicator .dot:nth-child(2) {
      animation-delay: -0.16s;
    }
    
    .typing-indicator .dot:nth-child(3) {
      animation-delay: 0s;
    }
    
    @keyframes typing {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    .a-custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .a-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .a-custom-scrollbar::-webkit-scrollbar-thumb { background-color: #8E2DE2; border-radius: 20px; }

    .spinner-alt {
      border: 4px solid rgba(255, 255, 255, 0.2);
      border-left-color: #A855F7; /* A nice purple */
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class UploadCodebaseComponent implements OnInit, OnDestroy {
  viewMode: 'input' | 'viewer' = 'input';
  repoUrl = '';
  repoName = '';
  isLoading = false;
  
  chatHistory: { author: 'user' | 'bot'; message: string }[] = [];
  chatInput = '';
  isTyping = false;
  
  diagramTypes = ['Component', 'Class', 'Sequence', 'UML'];
  
  repoFiles: FileNode[] = [];
  techStack: string[] = [];
  
  selectedFile: FileNode | null = null;
  currentRepoAnalysis: RepositoryAnalysis | null = null;
  savedCodebases$: Observable<SavedCodebase[]>;
  sharedCodebases$: Observable<SharedCodebase[]>;

  // Sharing functionality
  showShareDialog = false;
  shareName = '';
  shareDescription = '';
  isPublicShare = false;
  showPermissionDialog = false;
  permissionUserEmail = '';
  permissionType: 'read' | 'write' | 'admin' = 'read';
  selectedCodebaseForPermission = '';

  isEmployee = false;
  canUploadCodebases = true;
  canDeleteCodebases = false;
  isEmployer = false;
  isEducational = false;

  private userSubscription: Subscription;

  constructor(
    private enterpriseService: EnterpriseService, 
    private router: Router,
    private http: HttpClient,
    private codebaseService: CodebaseService,
    public authService: AuthService
  ) {
    this.savedCodebases$ = this.codebaseService.savedCodebases$;
    this.sharedCodebases$ = this.codebaseService.sharedCodebases$;

    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.isEmployee = user.role === 'enterprise_employee' || user.role === 'enterprise_employer';
        this.isEmployer = user.role === 'enterprise_employer';
        this.canDeleteCodebases = this.isEmployer;
      } else {
        this.isEmployee = false;
        this.isEmployer = false;
        this.canDeleteCodebases = false;
      }
    });
  }

  ngOnInit(): void {
    // Refresh shared codebases on init
    this.codebaseService.refreshSharedCodebases();
  }
  
  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    gsap.from('.container', {
      duration: 0.8,
      y: 30,
      opacity: 0,
      ease: 'power3.out',
    });
  }

  async loadRepo() {
    if (!this.repoUrl.trim() || !this.canUploadCodebases) return;
    
    this.isLoading = true;
    
    try {
      const response = await this.http.post<RepositoryAnalysis>(`${environment.apiUrl}/api/github/analyze`, {
        url: this.repoUrl
      }).toPromise();
      
      if (response) {
        this.currentRepoAnalysis = response;
        this.repoFiles = response.file_tree;
        this.techStack = response.tech_stack;
        this.repoName = response.repo;
        this.viewMode = 'viewer';
        this.chatHistory = [{ 
          author: 'bot', 
          message: `I've loaded the '${this.repoName}' repository. Found ${response.total_files} files and detected: ${response.tech_stack.join(', ')}. What would you like to know?` 
        }];
        // Scroll to bottom after initial message
        setTimeout(() => this.scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Error loading repository:', error);
      alert('Failed to load repository. Please check the URL and make sure it\'s a public repository.');
    } finally {
      this.isLoading = false;
    }
  }
  
  resetView() {
    this.viewMode = 'input';
    this.repoUrl = '';
    this.repoName = '';
    this.chatHistory = [];
    this.chatInput = '';
    this.selectedFile = null;
    this.repoFiles = [];
    this.techStack = [];
    this.currentRepoAnalysis = null;
  }

  toggleNode(node: FileNode) {
    if (node.type === 'folder') {
      node.expanded = !node.expanded;
    } else {
      this.selectFile(node);
    }
  }

  async selectFile(file: FileNode) {
    if (file.content) {
      this.selectedFile = file;
      return;
    }
    
    if (!file.path) {
      this.selectedFile = { ...file, content: '/* No content available for this file. */' };
      return;
    }
    
    try {
      const urlParts = this.repoUrl.replace('https://github.com/', '').split('/');
      const owner = urlParts[0];
      const repo = urlParts[1];
      
      const response = await this.http.get(`${environment.apiUrl}/api/github/content/${owner}/${repo}?path=${encodeURIComponent(file.path)}`).toPromise();
      
      if (response && 'content' in response) {
        file.content = (response as any).content;
        this.selectedFile = file;
      } else {
        file.content = '/* Could not load file content. */';
        this.selectedFile = file;
      }
    } catch (error) {
      console.error('Error fetching file content:', error);
      file.content = '/* Could not load file content. */';
      this.selectedFile = file;
    }
  }

  async sendChatMessage() {
    if (!this.chatInput.trim() || this.isTyping) return;

    const userMessage = this.chatInput;
    this.chatHistory.push({ author: 'user', message: userMessage });
    this.chatInput = '';
    this.isTyping = true; // Start typing animation
    
    // Scroll to bottom after adding user message
    setTimeout(() => this.scrollToBottom(), 100);

    const context = this.selectedFile?.content 
        ? `The user has the file '${this.selectedFile.name}' open. Here is its content:\n\n${this.selectedFile.content}`
        : "The user has no file open. The repository structure is being explored.";

    console.log('Sending chat message:', { userMessage, context });
    console.log('API URL:', `${environment.apiUrl}/api/chatbot/query`);

    try {
      const response = await this.http.post(`${environment.apiUrl}/api/chatbot/query`, { 
        message: userMessage, 
        context: context 
      }).toPromise();
      
      console.log('Chat response:', response);
      
      if (response && 'reply' in response) {
        this.chatHistory.push({ author: 'bot', message: (response as any).reply });
      } else {
        console.error('Unexpected response format:', response);
        this.chatHistory.push({ author: 'bot', message: 'Sorry, I received an unexpected response format.' });
      }
    } catch (error: any) {
      console.error('Error from chatbot:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        error: error.error
      });
      
      let errorMessage = 'Sorry, I encountered an error. Please check the console.';
      
      if (error.status === 0) {
        errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection.';
      } else if (error.status === 500) {
        errorMessage = 'Server error: The AI service is currently unavailable. Please try again later.';
      } else if (error.error && error.error.detail) {
        errorMessage = `Server error: ${error.error.detail}`;
      }
      
      this.chatHistory.push({ author: 'bot', message: errorMessage });
    } finally {
      this.isTyping = false; // Stop typing animation
      // Scroll to bottom after bot response
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  private scrollToBottom() {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  generateDiagram(type: string) {
    const prompt = `Generate a ${type} diagram for the ${this.repoName} codebase.`;
    this.router.navigate(['/dashboard/diagrams'], { queryParams: { prompt: prompt, type: type } });
  }

  saveCurrentCodebase(): void {
    if (this.currentRepoAnalysis) {
      this.codebaseService.saveCodebase(this.currentRepoAnalysis);
      alert('Codebase saved!');
      this.resetView();
    } else {
      alert('No active codebase to save.');
    }
  }

  deleteCodebase(codebaseId: string): void {
    if (confirm('Are you sure you want to delete this codebase?')) {
      this.codebaseService.deleteCodebase(codebaseId);
    }
  }

  loadSavedCodebase(codebase: SavedCodebase): void {
    this.currentRepoAnalysis = { ...codebase };
    this.repoFiles = codebase.file_tree;
    this.techStack = codebase.tech_stack;
    this.repoName = codebase.repo;
    this.viewMode = 'viewer';
    this.chatHistory = [{ 
      author: 'bot', 
      message: `I've loaded the '${this.repoName}' repository from your saved codebases. What would you like to know?` 
    }];
    // Scroll to bottom after loading saved codebase
    setTimeout(() => this.scrollToBottom(), 100);
  }

  openShareDialog() {
    if (this.currentRepoAnalysis) {
      this.shareName = `${this.currentRepoAnalysis.owner}/${this.currentRepoAnalysis.repo}`;
      this.shareDescription = `Repository analysis for ${this.currentRepoAnalysis.repo}`;
      this.showShareDialog = true;
    } else {
      alert('No active codebase to share. Please analyze a repository first.');
    }
  }

  closeShareDialog() {
    this.showShareDialog = false;
    this.shareName = '';
    this.shareDescription = '';
    this.isPublicShare = false;
  }

  async shareCodebase() {
    if (!this.currentRepoAnalysis || !this.shareName.trim()) {
      alert('Please provide a name for the shared codebase.');
      return;
    }

    try {
      await this.codebaseService.shareCodebase(
        this.currentRepoAnalysis,
        this.shareName,
        this.shareDescription,
        this.isPublicShare
      ).toPromise();

      alert('Codebase shared successfully!');
      this.closeShareDialog();
      
      // Reset to input view (home)
      this.resetView();
      
      // Refresh shared codebases to show the newly shared one
      this.codebaseService.refreshSharedCodebases();
    } catch (error) {
      console.error('Error sharing codebase:', error);
      alert('Failed to share codebase. Please try again.');
    }
  }

  openPermissionDialog(codebaseId: string) {
    this.selectedCodebaseForPermission = codebaseId;
    this.showPermissionDialog = true;
  }

  closePermissionDialog() {
    this.showPermissionDialog = false;
    this.permissionUserEmail = '';
    this.permissionType = 'read';
    this.selectedCodebaseForPermission = '';
  }

  async grantPermission() {
    if (!this.selectedCodebaseForPermission || !this.permissionUserEmail.trim()) {
      alert('Please provide a user email.');
      return;
    }

    try {
      await this.codebaseService.grantPermission(
        this.selectedCodebaseForPermission,
        this.permissionUserEmail,
        this.permissionType
      ).toPromise();

      alert('Permission granted successfully!');
      this.closePermissionDialog();
    } catch (error) {
      console.error('Error granting permission:', error);
      alert('Failed to grant permission. Please try again.');
    }
  }

  async loadSharedCodebase(codebase: SharedCodebase) {
    try {
      const codebaseData = await this.codebaseService.getCodebaseData(codebase.id).toPromise();
      
      if (codebaseData) {
        // Load the codebase data into the viewer
        this.currentRepoAnalysis = {
          owner: codebaseData.owner,
          repo: codebaseData.repo,
          file_tree: codebaseData.file_tree,
          tech_stack: codebaseData.tech_stack,
          repo_info: codebaseData.repo_info,
          total_files: codebaseData.total_files
        };
        
        this.repoFiles = codebaseData.file_tree;
        this.techStack = codebaseData.tech_stack;
        this.repoName = codebaseData.repo;
        this.viewMode = 'viewer';
        this.chatHistory = [{ 
          author: 'bot', 
          message: `I've loaded the shared codebase '${this.repoName}' (shared by ${codebase.owner_email}). What would you like to know?` 
        }];
        
        // Scroll to bottom after loading
        setTimeout(() => this.scrollToBottom(), 100);
      } else {
        alert('Could not load codebase data. Please try again.');
      }
    } catch (error) {
      console.error('Error loading shared codebase:', error);
      alert('Failed to load shared codebase. Please try again.');
    }
  }

  refreshSharedCodebases() {
    console.log('Manually refreshing shared codebases...');
    this.codebaseService.refreshSharedCodebases();
  }
} 