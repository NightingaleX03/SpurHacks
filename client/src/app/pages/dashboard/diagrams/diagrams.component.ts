import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-diagrams',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col">
      <!-- Initial View: Prompt and Selection -->
      <ng-container *ngIf="!isLoading && !diagramGenerated">
        <h2 class="text-2xl font-bold text-white mb-4">Architecture Diagrams</h2>
        <p class="text-gray-400 mb-6">
          Enter a prompt describing the system or process you want to visualize, then select a diagram type below to generate it.
        </p>

        <div class="flex flex-col gap-6">
          <textarea 
            class="w-full p-4 bg-dark-surface/50 border-2 border-neon-purple/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight transition-all duration-300" 
            placeholder="e.g., 'Design a login system with a front-end client, a back-end authentication service, and a user database.'"
            rows="5"
          ></textarea>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div *ngFor="let diagram of diagramTypes" class="tooltip-container">
              <button 
                (click)="selectDiagram(diagram.name)"
                [class.selected]="selectedDiagram === diagram.name"
                class="diagram-button w-full h-full"
              >
                {{ diagram.name }}
              </button>
              <div class="tooltip-text">{{ diagram.definition }}</div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button (click)="onGenerateDiagram()" class="neon-button px-8 py-3 text-lg bg-gradient-to-r from-neon-purple to-electric-blue text-white font-semibold rounded-lg border border-neon-purple hover:border-highlight transition-all duration-300">
            Generate Diagram
          </button>
        </div>
      </ng-container>

      <!-- Loading View -->
      <div *ngIf="isLoading" class="flex flex-col items-center justify-center min-h-[400px]">
        <div class="loader"></div>
        <p class="text-white mt-6 text-lg animate-pulse">
          Generating your <span class="font-semibold text-neon-purple">{{ selectedDiagram }}</span>...
        </p>
        <p class="text-gray-400 mt-2">This may take a few moments.</p>
      </div>

      <!-- Generated Diagram View -->
      <div *ngIf="diagramGenerated && !isLoading" class="generated-diagram">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-white">Generated Diagram: <span class="text-neon-purple">{{ selectedDiagram }}</span></h2>
            <button (click)="reset()" class="neon-button px-6 py-2 text-base bg-gradient-to-r from-electric-blue to-highlight text-white font-semibold rounded-lg border border-electric-blue hover:border-highlight transition-all duration-300">
                Generate New Diagram
            </button>
        </div>
        <div class="glass p-8 rounded-xl min-h-[400px] flex items-center justify-center border-2 border-neon-purple/30">
            <p class="text-gray-500 italic">Diagram placeholder for {{ selectedDiagram }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tooltip-container {
      position: relative;
    }

    .diagram-button {
      @apply p-4 bg-dark-surface/50 border border-neon-purple/50 rounded-lg text-gray-400 font-medium transition-all duration-300;
      @apply hover:border-neon-purple hover:text-neon-purple;
    }
    
    .diagram-button.selected {
      @apply border-highlight text-highlight bg-neon-purple/20;
    }

    .tooltip-text {
      visibility: hidden;
      width: 280px;
      background-color: var(--dark-surface);
      color: var(--dark-text);
      text-align: left;
      font-size: 0.875rem;
      line-height: 1.25rem;
      border-radius: 0.5rem;
      padding: 12px;
      position: absolute;
      z-index: 10;
      bottom: 110%;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      pointer-events: none;
      border: 1px solid var(--neon-purple);
      box-shadow: 0 4px 20px rgba(142, 45, 226, 0.2);
    }
    
    .tooltip-text::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: var(--neon-purple) transparent transparent transparent;
    }

    .tooltip-container:hover .tooltip-text {
      visibility: visible;
      opacity: 1;
    }
    
    .loader {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        position: relative;
        animation: rotate 1.2s linear infinite;
    }
    .loader::before, .loader::after {
        content: "";
        box-sizing: border-box;
        position: absolute;
        inset: 0px;
        border-radius: 50%;
        border: 5px solid var(--dark-surface);
        animation: prixClipFix 2.4s linear infinite;
    }
    .loader::after {
        border-color: var(--neon-purple);
        animation: prixClipFix 2.4s linear infinite , rotate 0.6s linear infinite reverse;
        inset: 6px;
    }

    @keyframes rotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @keyframes prixClipFix {
        0%   { clip-path: polygon(50% 50%,0 0,0 0,0 0,0 0,0 0) }
        25%  { clip-path: polygon(50% 50%,0 0,100% 0,100% 0,100% 0,100% 0) }
        50%  { clip-path: polygon(50% 50%,0 0,100% 0,100% 100%,100% 100%,100% 100%) }
        75%  { clip-path: polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 100%) }
        100% { clip-path: polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 0) }
    }
  `]
})
export class DiagramsComponent {
  isLoading = false;
  diagramGenerated = false;
  selectedDiagram: string | null = null;

  diagramTypes = [
    {
      name: 'Class Diagram',
      definition: 'Depicts the static structure of a system by showing its classes, attributes, methods, and the relationships between them. It is the building block of all object-oriented software systems.'
    },
    {
      name: 'Object Diagram',
      definition: 'Shows a snapshot of the instances of classes and their relationships at a specific point in time, illustrating real-world examples of the system\'s state.'
    },
    {
      name: 'Component Diagram',
      definition: 'Represents how the physical components in a system have been organized and shows the structural relationship between software system elements.'
    },
    {
      name: 'Deployment Diagram',
      definition: 'Represents the system hardware and its software. It details what hardware components exist and what software components run on them.'
    },
    {
      name: 'Package Diagram',
      definition: 'Depicts how packages and their elements are organized and shows the dependencies between different packages.'
    },
    {
      name: 'State Machine Diagram',
      definition: 'Represents the condition of the system or part of the system at finite instances of time, modeling the dynamic behavior of a class in response to time and changing external stimuli.'
    },
    {
      name: 'Activity Diagram',
      definition: 'Illustrates the flow of control in a system, visually depicting workflows of sequential and concurrent activities and the sequence in which they happen.'
    },
    {
      name: 'Use Case Diagram',
      definition: 'Depicts the functionality of a system by showing how external agents (users) interact with system functionalities, illustrating the system\'s functional requirements.'
    },
    {
      name: 'Sequence Diagram',
      definition: 'Shows object interactions arranged in a time sequence, depicting the objects and classes involved and the sequence of messages exchanged between them.'
    },
    {
      name: 'Communication Diagram',
      definition: 'Models the interactions between objects in terms of sequenced messages, describing both the static structure and dynamic behavior of a system.'
    },
    {
      name: 'Interaction Overview',
      definition: 'Provides a high-level view of the interactions within a system, similar to an Activity Diagram where the nodes themselves can be interaction diagrams.'
    },
    {
      name: 'UML',
      definition: 'The Unified Modeling Language (UML) is a standardized, general-purpose modeling language used to visualize, specify, construct, and document the artifacts of a software system.'
    }
  ];

  selectDiagram(diagramName: string) {
    this.selectedDiagram = diagramName;
  }

  onGenerateDiagram() {
    if (!this.selectedDiagram) {
      // In a real app, you might show an error message here.
      return; 
    }
    this.isLoading = true;
    this.diagramGenerated = false;

    setTimeout(() => {
      this.isLoading = false;
      this.diagramGenerated = true;
      
      gsap.from('.generated-diagram', {
        duration: 0.8,
        scale: 0.95,
        opacity: 0,
        ease: 'power3.out',
      });
    }, 3000);
  }

  reset() {
    this.isLoading = false;
    this.diagramGenerated = false;
    this.selectedDiagram = null;
  }
} 