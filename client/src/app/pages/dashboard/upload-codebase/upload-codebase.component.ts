import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { gsap } from 'gsap';
import { EnterpriseService } from '../../../services/enterprise.service';
import { HttpClient } from '@angular/common/http';

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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-4 md:p-8">
      <h2 class="text-4xl font-bold text-white mb-8">Codebase Intelligence</h2>

      <!-- Input View -->
      <ng-container *ngIf="viewMode === 'input'">
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
          <button type="submit" [disabled]="!repoUrl || isLoading" class="generate-button">
            <span *ngIf="isLoading">Analyzing...</span>
            <span *ngIf="!isLoading">Analyze Repository</span>
          </button>
        </form>
      </ng-container>

      <!-- Viewer View -->
      <ng-container *ngIf="viewMode === 'viewer'">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-white">Repository: <span class="text-neon-purple">{{ repoName }}</span></h3>
            <button (click)="resetView()" class="action-button">Analyze another repo</button>
        </div>

        <!-- VS Code-like Environment -->
        <div class="glass rounded-lg flex h-[500px] overflow-hidden border border-neon-purple/20">
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
            <div class="w-2/3 p-4 bg-dark-surface/50">
                 <pre class="bg-dark-surface p-4 rounded-md h-full overflow-auto text-sm a-custom-scrollbar"><code class="text-white language-typescript">{{ selectedFile?.content || 'Select a file to view its content.' }}</code></pre>
            </div>
        </div>

        <!-- Analysis Panels -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <!-- Chat -->
            <div class="glass p-4 rounded-lg">
              <h4 class="text-xl font-semibold text-white mb-4">Chat with Codebase AI</h4>
              <div class="h-64 overflow-y-auto bg-dark-surface/50 rounded-lg p-2 mb-4 flex flex-col space-y-2 a-custom-scrollbar">
                  <div *ngFor="let msg of chatHistory" class="chat-message" [class.user]="msg.author === 'user'" [class.bot]="msg.author === 'bot'">
                      <p>{{ msg.message }}</p>
                  </div>
              </div>
              <form (ngSubmit)="sendChatMessage()" class="flex gap-2">
                  <input [(ngModel)]="chatInput" name="chatInput" placeholder="e.g., 'Explain the auth service...'" class="flex-grow p-2 rounded bg-dark-surface/50 text-white border border-neon-purple/30">
                  <button type="submit" class="action-button">Send</button>
              </form>
            </div>
            <!-- Tech Stack -->
            <div class="glass p-4 rounded-lg">
                <h4 class="text-xl font-semibold text-white mb-4">Tech Stack</h4>
                <div class="flex flex-wrap gap-2">
                    <span *ngFor="let tech of techStack" class="px-2 py-1 bg-electric-blue/20 text-electric-blue rounded text-sm font-medium">
                        {{ tech }}
                    </span>
                </div>
            </div>
            <!-- Diagram Gen -->
            <div class="glass p-4 rounded-lg">
                <h4 class="text-xl font-semibold text-white mb-4">Generate Diagrams</h4>
                <p class="text-gray-400 mb-4">Select a diagram type to automatically generate it based on '{{ repoName }}'.</p>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                    <button *ngFor="let type of diagramTypes" (click)="generateDiagram(type)" class="diagram-type-button">{{ type }}</button>
                </div>
            </div>
        </div>
      </ng-container>

      <div *ngIf="!canUploadCodebases" class="text-center mt-8">
        <p class="text-red-400">You do not have permission to upload or analyze codebases.</p>
      </div>
    </div>
  `,
  styles: [`
    .generate-button { @apply px-8 py-3 rounded-lg bg-gradient-to-r from-neon-purple to-electric-blue text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all; }
    .action-button { @apply px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors; }
    .diagram-type-button { @apply px-4 py-2 rounded-lg bg-dark-surface/50 text-white border border-neon-purple/30 hover:bg-neon-purple/30 transition-all; }
    .chat-message { @apply p-2 rounded-lg max-w-xs; }
    .chat-message.user { @apply bg-electric-blue text-white self-end; }
    .chat-message.bot { @apply bg-gray-700 text-white self-start; }
    .active-file { @apply text-neon-purple bg-neon-purple/10; }
    .a-custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .a-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .a-custom-scrollbar::-webkit-scrollbar-thumb { background-color: #8E2DE2; border-radius: 20px; }
  `]
})
export class UploadCodebaseComponent implements AfterViewInit {
  viewMode: 'input' | 'viewer' = 'input';
  repoUrl = '';
  repoName = '';
  isLoading = false;
  
  chatHistory: { author: 'user' | 'bot'; message: string }[] = [];
  chatInput = '';
  
  diagramTypes = ['Component', 'Class', 'Sequence', 'UML'];
  
  repoFiles: FileNode[] = [];
  techStack: string[] = [];
  
  selectedFile: FileNode | null = null;

  isEmployee = false;
  canUploadCodebases = true;

  constructor(
    private enterpriseService: EnterpriseService, 
    private router: Router,
    private http: HttpClient
  ) {
    this.isEmployee = this.enterpriseService.isEmployee();
    if (this.isEmployee) {
      this.canUploadCodebases = this.enterpriseService.canAccessFeature('canUploadCodebases');
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
      const response = await this.http.post<RepositoryAnalysis>('http://localhost:8000/api/github/analyze', {
        url: this.repoUrl
      }).toPromise();
      
      if (response) {
        this.repoFiles = response.file_tree;
        this.techStack = response.tech_stack;
        this.repoName = response.repo;
        this.viewMode = 'viewer';
        this.chatHistory = [{ 
          author: 'bot', 
          message: `I've loaded the '${this.repoName}' repository. Found ${response.total_files} files and detected: ${response.tech_stack.join(', ')}. What would you like to know?` 
        }];
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
      
      const response = await this.http.get(`http://localhost:8000/api/github/content/${owner}/${repo}?path=${encodeURIComponent(file.path)}`).toPromise();
      
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

  sendChatMessage() {
    if (!this.chatInput.trim()) return;
    this.chatHistory.push({ author: 'user', message: this.chatInput });
    const userMessage = this.chatInput;
    this.chatInput = '';

    setTimeout(() => {
        this.chatHistory.push({ author: 'bot', message: `Regarding your question about "${userMessage}", I am analyzing the codebase...` });
    }, 1000);
  }

  generateDiagram(type: string) {
    const prompt = `Generate a ${type} diagram for the ${this.repoName} codebase.`;
    this.router.navigate(['/dashboard/diagrams'], { queryParams: { prompt: prompt, type: type } });
  }
} 