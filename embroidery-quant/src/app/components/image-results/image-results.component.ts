import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ImageData, ProcessingProgress } from '../../models/image-processing.models';

@Component({
  selector: 'app-image-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './image-results.html',
  styleUrl: './image-results.scss'
})
export class ImageResultsComponent {
  // Inputs
  readonly imageData = input<ImageData | null>(null);
  readonly processingProgress = input<ProcessingProgress | null>(null);
  
  // Internal state
  protected readonly showProgress = signal<boolean>(false);
  
  // Output events
  readonly downloadRequested = output<{canvas: HTMLCanvasElement, stage: string}>();
  
  protected onDownload(canvas: HTMLCanvasElement, stage: string): void {
    if (canvas) {
      this.downloadRequested.emit({ canvas, stage });
    }
  }
  
  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  protected getImageDimensions(canvas: HTMLCanvasElement): string {
    return `${canvas.width} × ${canvas.height}`;
  }
}
