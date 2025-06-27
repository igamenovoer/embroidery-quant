import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ImageProcessorComponent } from './components/image-processor/image-processor.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, MatButtonModule, MatIconModule, FileUploadComponent, ImageProcessorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'EmbroideryQuant';
  selectedFile: File | null = null;

  onFileSelected(file: File): void {
    console.log('File selected:', file.name);
    this.selectedFile = file;
  }
}
