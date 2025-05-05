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
      <!-- Side navigation buttons - visible on larger screens -->
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
      
      <!-- Always visible mobile navigation buttons -->
      <div class="floating-nav-buttons">
        <button 
          class="floating-nav-btn prev-floating-btn" 
          (click)="prevPage()" 
          [disabled]="page === 1"
          [class.disabled]="page === 1"
        >
          <span>&#10094;</span>
        </button>
        <button 
          class="floating-nav-btn next-floating-btn" 
          (click)="nextPage()" 
          [disabled]="page === totalPages"
          [class.disabled]="page === totalPages"
        >
          <span>&#10095;</span>
        </button>
      </div>
      
      <!-- Hamburger menu for mobile -->
      <button class="hamburger-btn" (click)="toggleMobileMenu()">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
      
      <!-- Top controls -->
      <div class="controls" [class.mobile-open]="mobileMenuOpen">
        <!-- Close button for mobile menu -->
        <button class="close-menu-btn" (click)="toggleMobileMenu()">×</button>
        
        <div class="page-info">
          <span class="page-label">Page {{ page }} of {{ totalPages }}</span>
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
        
        <!-- Mobile navigation buttons in menu -->
        <div class="mobile-nav-controls">
          <button 
            class="mobile-nav-btn" 
            (click)="prevPage()" 
            [disabled]="page === 1"
            [class.disabled]="page === 1"
          >
            <span>&#10094;</span>
          </button>
          <button 
            class="mobile-nav-btn" 
            (click)="nextPage()" 
            [disabled]="page === totalPages"
            [class.disabled]="page === totalPages"
          >
            <span>&#10095;</span>
          </button>
        </div>
      </div>
      
      <div *ngIf="error" class="error-message">
        Error loading PDF: {{ error }}
      </div>
      
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <span>Loading PDF... {{ progress }}%</span>
      </div>
      
      <!-- Overlay that appears when mobile menu is open -->
      <div 
        *ngIf="mobileMenuOpen" 
        class="menu-overlay"
        (click)="toggleMobileMenu()"
      ></div>
      
      <pdf-viewer
        [src]="pdfSrc"
        [render-text]="true"
        [original-size]="false"
        [show-all]="false"
        [page]="page"
        [zoom]="zoom"
        class="pdf-content"
        (after-load-complete)="afterLoadComplete($event)"
        (error)="onError($event)"
        (on-progress)="onProgress($event)"
        (click)="onPdfClick($event)"
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
      flex-wrap: wrap;
      transition: transform 0.3s ease;
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
    
    .mobile-nav-controls {
      display: none;
      align-items: center;
      gap: 10px;
    }
    
    .floating-nav-buttons {
      display: none; /* Hidden by default, shown only on mobile */
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 20;
      background-color: rgba(51, 51, 51, 0.8);
      border-radius: 25px;
      padding: 5px 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }
    
    .floating-nav-btn {
      width: 50px;
      height: 50px;
      border-radius: 25px;
      border: none;
      background-color: transparent;
      color: white;
      font-size: 20px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 0 5px;
      transition: background-color 0.2s;
    }
    
    .floating-nav-btn:hover, .floating-nav-btn:active {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .hamburger-btn {
      display: none;
      position: fixed;
      top: 10px;
      right: 10px;
      width: 40px;
      height: 40px;
      background-color: rgba(51, 51, 51, 0.8);
      border: none;
      border-radius: 5px;
      cursor: pointer;
      z-index: 20;
      flex-direction: column;
      justify-content: space-between;
      padding: 10px 8px;
    }
    
    .hamburger-line {
      display: block;
      width: 100%;
      height: 3px;
      background-color: white;
      border-radius: 3px;
    }
    
    .close-menu-btn {
      display: none;
      position: absolute;
      top: 10px;
      right: 10px;
      width: 30px;
      height: 30px;
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
    }
    
    .menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 5;
    }

    .mobile-nav-btn {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      border: none;
      background-color: #555;
      color: white;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mobile-nav-btn:hover {
      background-color: #777;
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
    
    .pdf-content {
      width: 100%; 
      height: calc(100vh - 60px);
      touch-action: pan-y pinch-zoom;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Tablet devices */
    @media (max-width: 1024px) {
      .controls {
        padding: 10px 15px;
      }
      
      .nav-btn {
        width: 35px;
        height: 70px;
      }
    }
    
    /* Mobile devices */
    @media (max-width: 768px) {
      .controls {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        flex-direction: column;
        height: auto;
        padding: 40px 20px 20px;
        gap: 15px;
        transform: translateY(-100%);
        transition: transform 0.3s ease;
      }
      
      .controls.mobile-open {
        transform: translateY(0);
      }
      
      .hamburger-btn {
        display: flex;
      }
      
      .close-menu-btn {
        display: block;
      }
      
      .page-info {
        width: 100%;
        justify-content: center;
      }
      
      .zoom-controls {
        width: 100%;
        justify-content: center;
      }
      
      .mobile-nav-controls {
        display: flex;
        justify-content: center;
        width: 100%;
        margin-top: 5px;
      }
      
      .nav-btn {
        display: none; /* Hide side navigation on mobile */
      }
      
      .floating-nav-buttons {
        display: flex; /* Show floating nav buttons on mobile */
      }
      
      .pdf-content {
        height: 100vh !important;
      }
    }
    
    /* Small mobile devices */
    @media (max-width: 480px) {
      .controls {
        gap: 10px;
      }
      
      .page-label {
        font-size: 14px;
      }
      
      .page-input {
        width: 50px;
      }
      
      .zoom-btn {
        width: 35px;
        height: 35px;
      }
      
      .mobile-nav-btn {
        width: 45px;
        height: 45px;
      }
    }
  `
})
export class PdfViewerComponent implements OnInit {
  // Use the external PDF URL
  pdfSrc = 'https://brisbanerotary.org.au/documents/en-us/d20ee52d-e62b-4fe8-a3bf-c58cb3a5fded/1';
  page = 1;
  totalPages = 0;
  zoom = 0.6; // Set default zoom to 60%
  error: string | null = null;
  loading = true;
  progress = 0;
  touchStartX: number = 0;
  touchEndX: number = 0;
  mobileMenuOpen = false;
  
  constructor() {
    console.log('PDF Viewer initialized with source:', this.pdfSrc);
  }

  ngOnInit(): void {
    // Set PDF.js worker path to make sure it works
    (window as any).pdfWorkerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    // Add event listeners for touch events
    this.addTouchEventListeners();
  }
  
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
  
  addTouchEventListeners(): void {
    // Add event listeners to detect swipe
    document.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);
  }
  
  handleTouchStart(e: TouchEvent): void {
    this.touchStartX = e.changedTouches[0].screenX;
  }
  
  handleTouchEnd(e: TouchEvent): void {
    this.touchEndX = e.changedTouches[0].screenX;
    this.handleSwipe();
  }
  
  handleSwipe(): void {
    const threshold = 100; // Minimum swipe distance
    
    if (this.touchEndX - this.touchStartX > threshold) {
      // Swipe right -> previous page
      this.prevPage();
    } else if (this.touchStartX - this.touchEndX > threshold) {
      // Swipe left -> next page
      this.nextPage();
    }
  }
  
  onPdfClick(event: MouseEvent): void {
    // If mobile menu is open, clicking the PDF should close it
    if (this.mobileMenuOpen) {
      this.mobileMenuOpen = false;
      return;
    }
    
    // Handle tap/click navigation on the PDF content area
    const pdfWidth = (event.currentTarget as HTMLElement).offsetWidth;
    const clickX = event.offsetX;
    
    // If click occurs in left 1/3, go to previous page
    if (clickX < pdfWidth / 3) {
      this.prevPage();
    } 
    // If click occurs in right 1/3, go to next page
    else if (clickX > (pdfWidth * 2) / 3) {
      this.nextPage();
    }
    // Middle click does nothing (for reading)
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
      case 'Escape':
        if (this.mobileMenuOpen) {
          this.mobileMenuOpen = false;
        }
        break;
    }
  }
}
