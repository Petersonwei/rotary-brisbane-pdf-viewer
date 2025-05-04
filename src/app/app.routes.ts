import { Routes } from '@angular/router';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';

export const routes: Routes = [
  { path: '', component: PdfViewerComponent },
  { path: 'pdf-viewer', component: PdfViewerComponent }
];
