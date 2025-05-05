import { Component } from '@angular/core';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PdfViewerComponent],
  template: `
    <app-pdf-viewer></app-pdf-viewer>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      margin: 0;
      padding: 0;
      overflow: hidden;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      touch-action: none;
    }
  `],
})
export class AppComponent {
  title = 'PDF Reader';
}
