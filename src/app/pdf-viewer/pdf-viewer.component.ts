import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfViewerModule],
  template: `
    <div class="pdf-container">
      <!-- Side navigation buttons -->
      <button 
        class="nav-btn prev-btn" 
        (click)="prevPage()" 
        [disabled]="page === 1"
        [class.disabled]="page === 1"
      >
        <span class="arrow">&#10094;</span>
      </button>
      
      <button 
        class="nav-btn next-btn" 
        (click)="nextPage()" 
        [disabled]="page === totalPages"
        [class.disabled]="page === totalPages"
      >
        <span class="arrow">&#10095;</span>
      </button>
      
      <!-- Mobile bottom toolbar -->
      <div class="mobile-toolbar">
        <div class="mobile-toolbar-nav">
          <button 
            class="mobile-nav-btn" 
            (click)="prevPage()" 
            [disabled]="page === 1"
          >
            <span>&#10094;</span>
          </button>
          <span class="mobile-page-info">{{ page }}/{{ totalPages }}</span>
          <button 
            class="mobile-nav-btn" 
            (click)="nextPage()" 
            [disabled]="page === totalPages"
          >
            <span>&#10095;</span>
          </button>
        </div>
        
        <div class="mobile-toolbar-zoom">
          <button class="mobile-zoom-btn" (click)="zoomOut()">−</button>
          <span class="mobile-zoom-info">{{ (zoom * 100).toFixed(0) }}%</span>
          <button class="mobile-zoom-btn" (click)="zoomIn()">+</button>
        </div>
      </div>
      
      <!-- Top controls -->
      <div class="controls">
        <div class="page-info">
          <span>Page {{ page }} of {{ totalPages }}</span>
          <input
            type="number"
            [(ngModel)]="page"
            min="1"
            [max]="totalPages"
            class="page-input"
          />
        </div>
        
        <div class="zoom-controls">
          <button class="zoom-btn" (click)="zoomOut()" title="Zoom Out">-</button>
          <span>{{ (zoom * 100).toFixed(0) }}%</span>
          <button class="zoom-btn" (click)="zoomIn()" title="Zoom In">+</button>
        </div>
      </div>
      
      <div *ngIf="error" class="error-message">
        Error loading PDF: {{ error }}
      </div>
      
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <span>Loading PDF... {{ progress }}%</span>
      </div>
      
      <pdf-viewer
        [src]="pdfSrc"
        [render-text]="true"
        [original-size]="false"
        [show-all]="false"
        [page]="page"
        [zoom]="zoom"
        style="width: 100%; height: calc(100vh - 60px);"
        (after-load-complete)="afterLoadComplete($event)"
        (error)="onError($event)"
        (on-progress)="onProgress($event)"
      ></pdf-viewer>
    </div>
  `,
  styles: `
    .pdf-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100vh;
      position: relative;
      overflow: hidden;
      background-color: #f0f0f0;
    }
    
    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #333;
      color: white;
      padding: 10px 20px;
      height: 60px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 10;
    }
    
    .page-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .zoom-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    /* Mobile toolbar styles */
    .mobile-toolbar {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      background-color: rgba(51, 51, 51, 0.9);
      padding: 10px 0;
      z-index: 100;
      flex-direction: column;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
    }
    
    .mobile-toolbar-nav, .mobile-toolbar-zoom {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5px 0;
      gap: 20px;
    }
    
    .mobile-toolbar-zoom {
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      padding-top: 10px;
      margin-top: 5px;
    }
    
    .mobile-nav-btn, .mobile-zoom-btn {
      background-color: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: pointer;
    }
    
    .mobile-nav-btn:active, .mobile-zoom-btn:active {
      background-color: rgba(255, 255, 255, 0.3);
    }
    
    .mobile-nav-btn[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .mobile-page-info, .mobile-zoom-info {
      color: white;
      font-size: 16px;
      min-width: 60px;
      text-align: center;
    }
    
    .page-input {
      width: 60px;
      padding: 5px;
      text-align: center;
      border: none;
      border-radius: 4px;
      background-color: #444;
      color: white;
    }
    
    .zoom-btn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: none;
      background-color: #555;
      color: white;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .zoom-btn:hover {
      background-color: #777;
    }
    
    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 80px;
      background-color: rgba(0, 0, 0, 0.3);
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s, width 0.3s;
      border-radius: 3px;
    }
    
    .nav-btn:hover {
      background-color: rgba(0, 0, 0, 0.6);
      width: 50px;
    }
    
    .prev-btn {
      left: 0;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    
    .next-btn {
      right: 0;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    
    .disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .arrow {
      user-select: none;
    }
    
    .error-message {
      position: absolute;
      top: 70px;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      background-color: #ff3333;
      padding: 10px 20px;
      border-radius: 4px;
      z-index: 20;
      max-width: 80%;
      text-align: center;
    }
    
    .loading {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 15;
    }
    
    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .controls {
        display: none; /* Hide top controls on mobile */
      }
      
      .mobile-toolbar {
        display: flex; /* Show mobile toolbar */
      }
      
      .nav-btn {
        display: none; /* Hide side buttons on mobile */
      }
      
      pdf-viewer {
        height: calc(100vh - 120px) !important; /* Adjust for mobile toolbar */
      }
    }
  `
})
export class PdfViewerComponent implements OnInit {
  // Use the external PDF URL
  pdfSrc = 'https://brisbanerotary.org.au/documents/en-us/d20ee52d-e62b-4fe8-a3bf-c58cb3a5fded/1';
  page = 1;
  totalPages = 0;
  zoom = 1.0; // Set default zoom to 100%
  error: string | null = null;
  loading = true;
  progress = 0;
  
  constructor() {
    console.log('PDF Viewer initialized with source:', this.pdfSrc);
  }

  ngOnInit(): void {
    // Set PDF.js worker path to make sure it works
    (window as any).pdfWorkerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }
  
  zoomIn(): void {
    if (this.zoom < 3) {
      this.zoom += 0.1;
    }
  }
  
  zoomOut(): void {
    if (this.zoom > 0.5) {
      this.zoom -= 0.1;
    }
  }

  afterLoadComplete(pdf: any): void {
    console.log('PDF loaded successfully. Total pages:', pdf.numPages);
    this.totalPages = pdf.numPages;
    this.error = null;
    this.loading = false;
  }
  
  onError(error: any): void {
    console.error('Error loading PDF:', error);
    this.error = JSON.stringify(error);
    this.loading = false;
  }
  
  onProgress(progressData: any): void {
    if (progressData.loaded && progressData.total) {
      this.progress = Math.round((progressData.loaded / progressData.total) * 100);
    }
  }
  
  // Add keyboard navigation
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    switch(event.key) {
      case 'ArrowRight':
        this.nextPage();
        break;
      case 'ArrowLeft':
        this.prevPage();
        break;
      case '+':
        this.zoomIn();
        break;
      case '-':
        this.zoomOut();
        break;
    }
  }
}
