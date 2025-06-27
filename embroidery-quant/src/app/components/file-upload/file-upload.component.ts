import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CanvasService } from '../../services/canvas.service';
import { ValidationResult } from '../../models/processing.models';

@Component({
  selector: 'app-file-upload',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Output() fileSelected = new EventEmitter<File>();

  private readonly canvasService = inject(CanvasService);

  isDragOver = false;
  isFileValid = true;
  validationMessage = '';
  isProcessing = false;

  readonly supportedFormats = ['image/jpeg', 'image/png', 'image/webp'];
  readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  private handleFileSelection(file: File): void {
    const validation = this.validateFile(file);
    
    if (validation.isValid) {
      this.isFileValid = true;
      this.validationMessage = '';
      this.isProcessing = true;
      
      // Emit the file to parent component
      this.fileSelected.emit(file);
      
      // Reset processing state after a short delay
      setTimeout(() => {
        this.isProcessing = false;
      }, 1000);
    } else {
      this.isFileValid = false;
      this.validationMessage = validation.errors.join('. ');
    }
    
    // Show warnings if any
    if (validation.warnings.length > 0) {
      console.warn('File upload warnings:', validation.warnings);
    }
  }

  private validateFile(file: File): ValidationResult {
    return this.canvasService.validateImageFile(file);
  }

  getAcceptedTypes(): string {
    return this.supportedFormats.join(',');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  clearValidation(): void {
    this.isFileValid = true;
    this.validationMessage = '';
  }
}