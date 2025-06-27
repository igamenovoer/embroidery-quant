# Class Design and Technical Architecture

## Overview

This document outlines the technical class design for the EmbroideryQuant Angular application, defining the core services, components, and data models that will implement the image quantization pipeline.

## Core Services

### 1. ImageProcessingService

**Purpose**: Orchestrates the entire image processing pipeline from upload to quantized output.

```typescript
@Injectable({ providedIn: 'root' })
export class ImageProcessingService {
  private readonly bilateralFilterService = inject(BilateralFilterService);
  private readonly quantizationService = inject(QuantizationService);
  private readonly canvasService = inject(CanvasService);

  // Main processing pipeline
  async processImage(file: File, config: ProcessingConfig): Promise<ProcessingResult>
  
  // Upload and validation
  async loadImageFromFile(file: File): Promise<ImageData>
  validateImageFile(file: File): ValidationResult
  
  // Progress tracking
  getProcessingProgress(): Observable<ProcessingProgress>
  cancelProcessing(): void
}
```

**Key Responsibilities**:
- Coordinate the three-stage processing pipeline (original → filtered → quantized)
- Manage processing state and progress notifications
- Handle file validation and error management
- Provide cancellation capabilities

### 2. BilateralFilterService

**Purpose**: Implements edge-preserving bilateral filtering as preprocessing step.

```typescript
@Injectable({ providedIn: 'root' })
export class BilateralFilterService {
  // Core filtering algorithm
  applyFilter(imageData: ImageData, params: BilateralParams): Promise<ImageData>
  
  // Real-time preview for parameter adjustment
  generatePreview(imageData: ImageData, params: BilateralParams): Promise<ImageData>
  
  // Parameter validation and optimization
  validateParameters(params: BilateralParams): boolean
  getOptimalParameters(imageData: ImageData): BilateralParams
  
  // Performance optimization
  private processChunked(imageData: ImageData, params: BilateralParams): Promise<ImageData>
  private shouldUseWebWorker(imageSize: number): boolean
}
```

**Key Responsibilities**:
- Implement bilateral filter algorithm with configurable sigma parameters
- Provide real-time preview generation for parameter adjustment
- Optimize performance through chunked processing and Web Workers
- Parameter validation and intelligent defaults

### 3. QuantizationService

**Purpose**: Wraps RgbQuant.js library and implements quantization algorithms.

```typescript
@Injectable({ providedIn: 'root' })
export class QuantizationService {
  private rgbQuant: any; // RgbQuant.js instance
  
  // Core quantization
  quantizeImage(imageData: ImageData, config: QuantizationConfig): Promise<QuantizedResult>
  
  // Palette management
  generatePalette(imageData: ImageData, colorCount: number): Promise<Color[]>
  applyCustomPalette(imageData: ImageData, palette: Color[]): Promise<ImageData>
  
  // Dithering options
  applyDithering(imageData: ImageData, algorithm: DitheringAlgorithm): Promise<ImageData>
  
  // Embroidery-specific presets
  getEmbroideryPresets(): QuantizationConfig[]
  optimizeForEmbroidery(config: QuantizationConfig): QuantizationConfig
}
```

**Key Responsibilities**:
- Interface with RgbQuant.js library
- Manage color palette generation and application
- Implement various dithering algorithms
- Provide embroidery-specific optimization presets

### 4. CanvasService

**Purpose**: Handles all Canvas API operations and rendering logic.

```typescript
@Injectable({ providedIn: 'root' })
export class CanvasService {
  // Canvas management
  createCanvas(width: number, height: number): HTMLCanvasElement
  resizeCanvas(canvas: HTMLCanvasElement, newWidth: number, newHeight: number): void
  
  // Image data conversion
  imageToCanvas(image: HTMLImageElement): HTMLCanvasElement
  canvasToImageData(canvas: HTMLCanvasElement): ImageData
  imageDataToCanvas(imageData: ImageData): HTMLCanvasElement
  
  // Rendering and display
  renderSideBySide(original: HTMLCanvasElement, processed: HTMLCanvasElement): void
  generateThumbnail(canvas: HTMLCanvasElement, maxSize: number): HTMLCanvasElement
  
  // Export functionality
  exportAsBlob(canvas: HTMLCanvasElement, format: 'png' | 'jpeg', quality?: number): Promise<Blob>
  downloadImage(canvas: HTMLCanvasElement, filename: string): void
}
```

**Key Responsibilities**:
- Abstract Canvas API operations
- Handle image format conversions
- Manage rendering and display logic
- Provide export and download functionality

### 5. WebGPUService (Optional - Advanced Implementation)

**Purpose**: Provides GPU acceleration when WebGPU is available.

```typescript
@Injectable({ providedIn: 'root' })
export class WebGPUService {
  private device?: GPUDevice;
  private adapter?: GPUAdapter;
  
  // Initialization and capability detection
  async initialize(): Promise<boolean>
  isSupported(): boolean
  getCapabilities(): WebGPUCapabilities
  
  // GPU-accelerated operations
  async gpuBilateralFilter(imageData: ImageData, params: BilateralParams): Promise<ImageData>
  async gpuQuantization(imageData: ImageData, config: QuantizationConfig): Promise<ImageData>
  
  // Shader management
  private createComputePipeline(shaderCode: string): GPUComputePipeline
  private executeCompute(pipeline: GPUComputePipeline, buffers: GPUBuffer[]): Promise<ArrayBuffer>
}
```

**Key Responsibilities**:
- Detect and initialize WebGPU capabilities
- Implement GPU-accelerated image processing algorithms
- Provide fallback mechanisms when GPU acceleration is unavailable
- Manage GPU resources and memory

## Core Components

### 1. AppComponent

**Purpose**: Root component that orchestrates the main application layout and routing.

```typescript
@Component({
  selector: 'app-root',
  template: `
    <app-header></app-header>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `
})
export class AppComponent {
  title = 'EmbroideryQuant';
}
```

### 2. ImageProcessorComponent

**Purpose**: Main processing interface that handles the complete workflow.

```typescript
@Component({
  selector: 'app-image-processor',
  templateUrl: './image-processor.component.html',
  styleUrls: ['./image-processor.component.scss']
})
export class ImageProcessorComponent implements OnInit, OnDestroy {
  private readonly imageService = inject(ImageProcessingService);
  
  // State management
  currentStage: ProcessingStage = 'upload';
  originalImage?: HTMLCanvasElement;
  filteredImage?: HTMLCanvasElement;
  quantizedImage?: HTMLCanvasElement;
  
  // Configuration
  bilateralParams = new BilateralParams();
  quantizationConfig = new QuantizationConfig();
  
  // Progress tracking
  processingProgress$ = this.imageService.getProcessingProgress();
  isProcessing = false;
  
  // Event handlers
  onFileUpload(file: File): Promise<void>
  onBilateralParamsChange(params: BilateralParams): void
  onQuantizationConfigChange(config: QuantizationConfig): void
  onProcessImage(): Promise<void>
  onDownloadResult(): void
  onCancelProcessing(): void
}
```

**Key Responsibilities**:
- Manage the three-stage UI (original → filtered → quantized)
- Handle user interactions and parameter changes
- Display processing progress and status
- Coordinate with services for image processing

### 3. FileUploadComponent

**Purpose**: Handles file upload with drag & drop functionality.

```typescript
@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  @Output() fileSelected = new EventEmitter<File>();
  
  // Drag & drop state
  isDragOver = false;
  isFileValid = true;
  validationMessage = '';
  
  // Supported formats
  readonly supportedFormats = ['image/jpeg', 'image/png', 'image/webp'];
  readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  
  // Event handlers
  onDragOver(event: DragEvent): void
  onDragLeave(event: DragEvent): void
  onDrop(event: DragEvent): void
  onFileInputChange(event: Event): void
  
  // Validation
  private validateFile(file: File): ValidationResult
  private handleFileSelection(file: File): void
}
```

**Key Responsibilities**:
- Implement drag & drop file upload interface
- Validate file format, size, and integrity
- Provide visual feedback for upload states
- Emit file selection events to parent components

### 4. ParameterPanelComponent

**Purpose**: Interactive controls for bilateral filter and quantization parameters.

```typescript
@Component({
  selector: 'app-parameter-panel',
  templateUrl: './parameter-panel.component.html',
  styleUrls: ['./parameter-panel.component.scss']
})
export class ParameterPanelComponent implements OnInit {
  @Input() bilateralParams!: BilateralParams;
  @Input() quantizationConfig!: QuantizationConfig;
  @Output() bilateralParamsChange = new EventEmitter<BilateralParams>();
  @Output() quantizationConfigChange = new EventEmitter<QuantizationConfig>();
  
  // UI state
  showAdvancedOptions = false;
  previewMode = true;
  
  // Presets
  embroideryPresets: QuantizationConfig[] = [];
  
  // Parameter controls
  onSigmaSpaceChange(value: number): void
  onSigmaColorChange(value: number): void
  onColorCountChange(value: number): void
  onDitheringAlgorithmChange(algorithm: DitheringAlgorithm): void
  
  // Preset management
  loadPreset(preset: QuantizationConfig): void
  saveAsPreset(): void
  resetToDefaults(): void
}
```

**Key Responsibilities**:
- Provide interactive controls for all processing parameters
- Implement real-time parameter adjustment with preview
- Manage preset configurations for common embroidery scenarios
- Toggle between basic and advanced parameter sets

### 5. ImageComparisonComponent

**Purpose**: Side-by-side display of original, filtered, and quantized images.

```typescript
@Component({
  selector: 'app-image-comparison',
  templateUrl: './image-comparison.component.html',
  styleUrls: ['./image-comparison.component.scss']
})
export class ImageComparisonComponent implements OnInit, AfterViewInit {
  @Input() originalImage?: HTMLCanvasElement;
  @Input() filteredImage?: HTMLCanvasElement;
  @Input() quantizedImage?: HTMLCanvasElement;
  
  @ViewChild('originalCanvas', { static: true }) originalCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('filteredCanvas', { static: true }) filteredCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('quantizedCanvas', { static: true }) quantizedCanvas!: ElementRef<HTMLCanvasElement>;
  
  // Display options
  zoomLevel = 1.0;
  showZoomControls = true;
  syncPanning = true;
  
  // Methods
  updateDisplays(): void
  zoomIn(): void
  zoomOut(): void
  resetZoom(): void
  fitToContainer(): void
  
  // Pan and zoom synchronization
  private syncCanvasPanning(): void
  private handleCanvasInteraction(event: MouseEvent): void
}
```

**Key Responsibilities**:
- Display three processing stages side-by-side
- Implement zoom and pan functionality
- Synchronize interactions across multiple canvases
- Provide optimal viewing experience for comparison

### 6. ProgressIndicatorComponent

**Purpose**: Shows processing progress with cancellation option.

```typescript
@Component({
  selector: 'app-progress-indicator',
  templateUrl: './progress-indicator.component.html',
  styleUrls: ['./progress-indicator.component.scss']
})
export class ProgressIndicatorComponent implements OnInit {
  @Input() progress$!: Observable<ProcessingProgress>;
  @Output() cancelRequested = new EventEmitter<void>();
  
  // Progress state
  currentProgress = 0;
  currentStage = '';
  estimatedTimeRemaining = 0;
  
  // UI state
  showCancelButton = true;
  showEstimatedTime = true;
  
  // Methods
  onCancelClick(): void
  formatTimeRemaining(seconds: number): string
  
  // Progress calculation
  private calculateProgress(progress: ProcessingProgress): number
  private estimateTimeRemaining(progress: ProcessingProgress): number
}
```

**Key Responsibilities**:
- Display real-time processing progress
- Show current processing stage and estimated completion time
- Provide cancellation functionality
- Calculate and display progress percentages

## Data Models

### Core Configuration Models

```typescript
// Bilateral filter parameters
export class BilateralParams {
  sigmaSpace: number = 15;      // Spatial filtering strength (10-20)
  sigmaColor: number = 30;      // Color similarity threshold (20-40)
  kernelSize: number = 9;       // Filter kernel size (5-15)
  iterations: number = 1;       // Multiple pass filtering
}

// Quantization configuration
export class QuantizationConfig {
  colorCount: number = 16;                           // Target color count (2-64)
  method: number = 2;                                // RgbQuant method (histogram-based)
  ditheringAlgorithm: DitheringAlgorithm = 'FloydSteinberg';
  ditheringIntensity: number = 0.05;                 // Dithering strength (0-1)
  serpentineMode: boolean = true;                    // Serpentine dithering
  minHueColors: number = 2;                          // Minimum colors per hue
  preserveAlpha: boolean = true;                     // Handle transparency
  embroideryOptimized: boolean = true;               // Embroidery-specific optimizations
}

// Processing result container
export class ProcessingResult {
  originalImage: HTMLCanvasElement;
  filteredImage: HTMLCanvasElement;
  quantizedImage: HTMLCanvasElement;
  colorPalette: Color[];
  processingTime: number;
  quality: QualityMetrics;
}

// Color representation
export class Color {
  r: number;
  g: number;
  b: number;
  a: number = 255;
  hex: string;
  lab?: LABColor;                                    // For perceptual calculations
  
  constructor(r: number, g: number, b: number, a: number = 255)
  toHex(): string
  toLAB(): LABColor
  distance(other: Color): number                     // Perceptual color distance
}
```

### State Management Models

```typescript
// Processing stages
export type ProcessingStage = 'upload' | 'filtering' | 'quantizing' | 'complete' | 'error';

// Progress tracking
export interface ProcessingProgress {
  stage: ProcessingStage;
  percentage: number;
  currentOperation: string;
  estimatedTimeRemaining: number;
  canCancel: boolean;
}

// File validation
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

// Quality metrics
export interface QualityMetrics {
  ssim: number;                                      // Structural similarity
  psnr: number;                                      // Peak signal-to-noise ratio
  colorAccuracy: number;                             // Color preservation score
  edgePreservation: number;                          // Edge detail retention
  embroideryScore: number;                           // Embroidery suitability rating
}

// Performance monitoring
export interface PerformanceMetrics {
  totalProcessingTime: number;
  bilateralFilterTime: number;
  quantizationTime: number;
  renderingTime: number;
  memoryUsage: number;
  gpuAccelerated: boolean;
}
```

### Utility Enums

```typescript
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
  Draft = 'draft',           // Fast preview
  Standard = 'standard',     // Balanced quality/speed
  High = 'high',            // Best quality
  Custom = 'custom'         // User-defined parameters
}

export enum ExportFormat {
  PNG = 'png',
  JPEG = 'jpeg',
  WebP = 'webp'
}
```

## Component Interaction Flow

### 1. Image Upload Flow
```
FileUploadComponent → ImageProcessorComponent → ImageProcessingService → CanvasService
```

### 2. Parameter Adjustment Flow
```
ParameterPanelComponent → ImageProcessorComponent → BilateralFilterService (preview)
```

### 3. Processing Flow
```
ImageProcessorComponent → ImageProcessingService → BilateralFilterService → QuantizationService → ImageComparisonComponent
```

### 4. Progress Tracking Flow
```
ImageProcessingService → ProgressIndicatorComponent
```

## Performance Considerations

### Memory Management
- Use Web Workers for large image processing to prevent UI blocking
- Implement image downsampling for preview operations
- Clean up Canvas elements and ImageData objects promptly
- Monitor memory usage and implement garbage collection hints

### GPU Acceleration Strategy
- Detect WebGPU/WebGL capabilities on initialization
- Implement progressive fallback: WebGPU → WebGL → Web Workers → Main Thread
- Cache GPU resources and reuse compute pipelines
- Provide user option to disable GPU acceleration

### Caching Strategy
- Cache bilateral filter results when only quantization parameters change
- Implement LRU cache for frequently used parameter combinations
- Store user preferences in localStorage
- Cache generated thumbnails for quick preview

## Testing Strategy

### Unit Tests
- Service method testing with mock data
- Component behavior testing with Angular TestBed
- Algorithm correctness validation
- Performance benchmarking

### Integration Tests
- End-to-end workflow testing
- Cross-browser compatibility verification
- Mobile device testing
- Performance regression testing

### User Acceptance Testing
- Embroidery pattern quality assessment
- Usability testing with target users
- Accessibility compliance verification
- Performance on various device configurations

This class design provides a solid foundation for implementing the EmbroideryQuant application with clear separation of concerns, testable architecture, and extensible design patterns.