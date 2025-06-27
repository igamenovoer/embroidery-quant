export class BilateralParams {
  sigmaSpace: number = 15;
  sigmaColor: number = 30;
  kernelSize: number = 9;
  iterations: number = 1;

  constructor(
    sigmaSpace: number = 15,
    sigmaColor: number = 30,
    kernelSize: number = 9,
    iterations: number = 1
  ) {
    this.sigmaSpace = sigmaSpace;
    this.sigmaColor = sigmaColor;
    this.kernelSize = kernelSize;
    this.iterations = iterations;
  }
}

export enum DitheringAlgorithm {
  None = 'none',
  FloydSteinberg = 'FloydSteinberg',
  Atkinson = 'Atkinson',
  Burkes = 'Burkes',
  Stucki = 'Stucki',
  Sierra2 = 'Sierra2',
  Sierra3 = 'Sierra3',
  SierraLite = 'SierraLite'
}

export enum ProcessingQuality {
  Draft = 'draft',
  Standard = 'standard',
  High = 'high',
  Custom = 'custom'
}

export enum ExportFormat {
  PNG = 'png',
  JPEG = 'jpeg',
  WebP = 'webp'
}

export class QuantizationConfig {
  colorCount: number = 16;
  method: number = 2;
  ditheringAlgorithm: DitheringAlgorithm = DitheringAlgorithm.FloydSteinberg;
  ditheringIntensity: number = 0.05;
  serpentineMode: boolean = true;
  minHueColors: number = 2;
  preserveAlpha: boolean = true;
  embroideryOptimized: boolean = true;

  constructor(config?: Partial<QuantizationConfig>) {
    if (config) {
      Object.assign(this, config);
    }
  }
}

export class LABColor {
  constructor(
    public l: number,
    public a: number,
    public b: number
  ) {}
}

export class Color {
  r: number;
  g: number;
  b: number;
  a: number = 255;
  hex: string;
  lab?: LABColor;

  constructor(r: number, g: number, b: number, a: number = 255) {
    this.r = Math.round(Math.max(0, Math.min(255, r)));
    this.g = Math.round(Math.max(0, Math.min(255, g)));
    this.b = Math.round(Math.max(0, Math.min(255, b)));
    this.a = Math.round(Math.max(0, Math.min(255, a)));
    this.hex = this.toHex();
  }

  toHex(): string {
    const toHexComponent = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHexComponent(this.r)}${toHexComponent(this.g)}${toHexComponent(this.b)}`;
  }

  toLAB(): LABColor {
    if (!this.lab) {
      this.lab = this.rgbToLab();
    }
    return this.lab;
  }

  distance(other: Color): number {
    const lab1 = this.toLAB();
    const lab2 = other.toLAB();
    
    const deltaL = lab1.l - lab2.l;
    const deltaA = lab1.a - lab2.a;
    const deltaB = lab1.b - lab2.b;
    
    return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
  }

  private rgbToLab(): LABColor {
    let r = this.r / 255;
    let g = this.g / 255;
    let b = this.b / 255;

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

    return new LABColor(
      (116 * y) - 16,
      500 * (x - y),
      200 * (y - z)
    );
  }
}

export class ProcessingResult {
  originalImage: HTMLCanvasElement;
  filteredImage: HTMLCanvasElement;
  quantizedImage: HTMLCanvasElement;
  colorPalette: Color[];
  processingTime: number;
  quality: QualityMetrics;

  constructor(
    originalImage: HTMLCanvasElement,
    filteredImage: HTMLCanvasElement,
    quantizedImage: HTMLCanvasElement,
    colorPalette: Color[],
    processingTime: number,
    quality: QualityMetrics
  ) {
    this.originalImage = originalImage;
    this.filteredImage = filteredImage;
    this.quantizedImage = quantizedImage;
    this.colorPalette = colorPalette;
    this.processingTime = processingTime;
    this.quality = quality;
  }
}

export type ProcessingStage = 'upload' | 'filtering' | 'quantizing' | 'complete' | 'error';

export interface ProcessingProgress {
  stage: ProcessingStage;
  percentage: number;
  currentOperation: string;
  estimatedTimeRemaining: number;
  canCancel: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo?: FileInfo;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  dimensions: { width: number; height: number };
  hasTransparency: boolean;
}

export interface QualityMetrics {
  ssim: number;
  psnr: number;
  colorAccuracy: number;
  edgePreservation: number;
  embroideryScore: number;
}

export interface PerformanceMetrics {
  totalProcessingTime: number;
  bilateralFilterTime: number;
  quantizationTime: number;
  renderingTime: number;
  memoryUsage: number;
  gpuAccelerated: boolean;
}