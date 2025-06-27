import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-image-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.scss'
})
export class ImageUploadComponent {
  // Reactive state using signals
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly isDragOver = signal<boolean>(false);
  protected readonly isProcessing = signal<boolean>(false);
  
  // Output events
  readonly fileSelected = output<File>();
  
  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && this.isValidImageFile(file)) {
      this.selectedFile.set(file);
      this.fileSelected.emit(file);
    }
  }
  
  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }
  
  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }
  
  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    
    const file = event.dataTransfer?.files[0];
    if (file && this.isValidImageFile(file)) {
      this.selectedFile.set(file);
      this.fileSelected.emit(file);
    }
  }
  
  private isValidImageFile(file: File): boolean {
    return file.type.startsWith('image/') && file.size <= 50 * 1024 * 1024; // 50MB limit
  }
}
