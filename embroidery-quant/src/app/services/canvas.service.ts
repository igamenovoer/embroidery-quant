import { Injectable } from '@angular/core';
import { ValidationResult, FileInfo } from '../models/processing.models';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  resizeCanvas(canvas: HTMLCanvasElement, newWidth: number, newHeight: number): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    const tempCanvas = this.createCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(imageData, 0, 0);
    
    ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
  }

  async imageToCanvas(image: HTMLImageElement): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      if (!image.complete) {
        image.onload = () => this.drawImageToCanvas(image, resolve);
        image.onerror = reject;
      } else {
        this.drawImageToCanvas(image, resolve);
      }
    });
  }

  private drawImageToCanvas(image: HTMLImageElement, resolve: (canvas: HTMLCanvasElement) => void): void {
    const canvas = this.createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0);
    resolve(canvas);
  }

  canvasToImageData(canvas: HTMLCanvasElement): ImageData {
    const ctx = canvas.getContext('2d')!;
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
    const canvas = this.createCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  renderSideBySide(canvases: HTMLCanvasElement[], targetCanvas: HTMLCanvasElement): void {
    if (canvases.length === 0) return;

    const ctx = targetCanvas.getContext('2d')!;
    const totalWidth = canvases.reduce((sum, canvas) => sum + canvas.width, 0);
    const maxHeight = Math.max(...canvases.map(canvas => canvas.height));

    targetCanvas.width = totalWidth;
    targetCanvas.height = maxHeight;

    let xOffset = 0;
    canvases.forEach(canvas => {
      ctx.drawImage(canvas, xOffset, 0);
      xOffset += canvas.width;
    });
  }

  generateThumbnail(canvas: HTMLCanvasElement, maxSize: number): HTMLCanvasElement {
    const { width, height } = canvas;
    const ratio = Math.min(maxSize / width, maxSize / height);
    
    if (ratio >= 1) {
      return canvas;
    }

    const newWidth = Math.round(width * ratio);
    const newHeight = Math.round(height * ratio);
    
    const thumbnail = this.createCanvas(newWidth, newHeight);
    const ctx = thumbnail.getContext('2d')!;
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
    
    return thumbnail;
  }

  async exportAsBlob(canvas: HTMLCanvasElement, format: 'png' | 'jpeg' | 'webp', quality?: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const mimeType = `image/${format}`;
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error(`Failed to export canvas as ${format}`));
          }
        },
        mimeType,
        quality
      );
    });
  }

  async downloadImage(canvas: HTMLCanvasElement, filename: string, format: 'png' | 'jpeg' | 'webp' = 'png'): Promise<void> {
    try {
      const blob = await this.exportAsBlob(canvas, format);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${format}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  async loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  validateImageFile(file: File): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const maxDimensions = 4096;

    if (!supportedTypes.includes(file.type)) {
      errors.push(`Unsupported file type: ${file.type}. Supported types: ${supportedTypes.join(', ')}`);
    }

    if (file.size > maxFileSize) {
      errors.push(`File size (${this.formatBytes(file.size)}) exceeds maximum allowed size (${this.formatBytes(maxFileSize)})`);
    }

    if (file.size > 1024 * 1024) {
      warnings.push('Large file size may affect performance');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        dimensions: { width: 0, height: 0 }, // Will be filled when image loads
        hasTransparency: file.type === 'image/png' || file.type === 'image/webp'
      }
    };
  }

  async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    const img = await this.loadImageFromFile(file);
    return { width: img.width, height: img.height };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  copyCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
    const copy = this.createCanvas(source.width, source.height);
    const ctx = copy.getContext('2d')!;
    ctx.drawImage(source, 0, 0);
    return copy;
  }

  clearCanvas(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

}