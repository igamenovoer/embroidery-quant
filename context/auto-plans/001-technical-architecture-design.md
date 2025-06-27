# 001 - Technical Architecture Design for EmbroideryQuant Angular App

## Overview
Design document for the technical classes and architecture of the Embroidery Oriented Image Quantization Angular application.

## Application Structure

### Core Components Architecture

```
AppComponent (Root)
├── HeaderComponent (App title and navigation)
├── ImageUploadComponent (Drag & drop, file selection)
├── ParameterControlComponent (Sliders and input controls)
└── ImageResultsComponent (4-panel image display)
```

### Service Layer Architecture

```
Services
├── ImageProcessingService (Main orchestrator)
├── BilateralFilterService (Edge-preserving filtering)
├── QuantizationService (RgbQuant.js wrapper)
├── DitheringService (Dithering algorithms)
├── CanvasService (Canvas operations and utilities)
└── FileService (File upload/download operations)
```

## Detailed Class Design

### 1. Core Models and Interfaces

```typescript
// Core data models
interface ImageData {
  originalFile: File;
  originalCanvas: HTMLCanvasElement;
  filteredCanvas?: HTMLCanvasElement;
  quantizedCanvas?: HTMLCanvasElement;
  ditheredCanvas?: HTMLCanvasElement;
  width: number;
  height: number;
}

interface ProcessingParameters {
  // Bilateral Filter Parameters
  sigmaSpace: number;     // Spatial filter sigma (10-20)
  sigmaColor: number;     // Color filter sigma (20-40)
  
  // Quantization Parameters
  colorCount: number;     // Number of colors (2-256)
  method: number;         // RgbQuant method (1-3)
  
  // Dithering Parameters
  ditheringAlgorithm: DitheringType;
  ditheringStrength: number;
}

enum DitheringType {
  NONE = 'none',
  FLOYD_STEINBERG = 'FloydSteinberg',
  ATKINSON = 'Atkinson',
  BURKES = 'Burkes',
  STUCKI = 'Stucki',
  SIERRA = 'Sierra'
}

interface ProcessingProgress {
  stage: ProcessingStage;
  progress: number;       // 0-100
  message: string;
  canCancel: boolean;
}

enum ProcessingStage {
  UPLOADING = 'uploading',
  FILTERING = 'filtering',
  QUANTIZING = 'quantizing',
  DITHERING = 'dithering',
  COMPLETE = 'complete',
  ERROR = 'error'
}
```

### 2. Component Classes

#### ImageUploadComponent
```typescript
@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  @Output() imageSelected = new EventEmitter<File>();
  @Output() imageLoaded = new EventEmitter<ImageData>();
  
  isDragOver = false;
  isProcessing = false;
  errorMessage = '';
  
  // Methods
  onFileSelected(event: Event): void
  onDragOver(event: DragEvent): void
  onDragLeave(event: DragEvent): void
  onDrop(event: DragEvent): void
  private validateFile(file: File): boolean
  private loadImage(file: File): Promise<ImageData>
}
```

#### ParameterControlComponent
```typescript
@Component({
  selector: 'app-parameter-control',
  templateUrl: './parameter-control.component.html',
  styleUrls: ['./parameter-control.component.scss']
})
export class ParameterControlComponent {
  @Input() enabled = true;
  @Output() parametersChanged = new EventEmitter<ProcessingParameters>();
  @Output() processRequested = new EventEmitter<void>();
  
  parameters: ProcessingParameters = {
    sigmaSpace: 15,
    sigmaColor: 30,
    colorCount: 16,
    method: 2,
    ditheringAlgorithm: DitheringType.FLOYD_STEINBERG,
    ditheringStrength: 1.0
  };
  
  ditheringOptions = Object.values(DitheringType);
  
  // Methods
  onParameterChange(): void
  onProcessClick(): void
  resetToDefaults(): void
}
```

#### ImageResultsComponent
```typescript
@Component({
  selector: 'app-image-results',
  templateUrl: './image-results.component.html',
  styleUrls: ['./image-results.component.scss']
})
export class ImageResultsComponent {
  @Input() imageData: ImageData | null = null;
  @Input() processingProgress: ProcessingProgress | null = null;
  @Output() downloadRequested = new EventEmitter<HTMLCanvasElement>();
  
  showProgress = false;
  
  // Methods
  onDownload(canvas: HTMLCanvasElement, stage: string): void
  private formatFileSize(bytes: number): string
  private getImageDimensions(canvas: HTMLCanvasElement): string
}
```

### 3. Service Classes

#### ImageProcessingService (Main Orchestrator)
```typescript
@Injectable({
  providedIn: 'root'
})
export class ImageProcessingService {
  private processingSubject = new BehaviorSubject<ProcessingProgress | null>(null);
  public processing$ = this.processingSubject.asObservable();
  
  private currentImageData: ImageData | null = null;
  private cancellationToken: boolean = false;
  
  constructor(
    private bilateralFilterService: BilateralFilterService,
    private quantizationService: QuantizationService,
    private ditheringService: DitheringService,
    private canvasService: CanvasService
  ) {}
  
  // Methods
  async processImage(imageData: ImageData, parameters: ProcessingParameters): Promise<ImageData>
  cancelProcessing(): void
  getCurrentImageData(): ImageData | null
  
  private updateProgress(stage: ProcessingStage, progress: number, message: string): void
  private checkCancellation(): void
}
```

#### BilateralFilterService
```typescript
@Injectable({
  providedIn: 'root'
})
export class BilateralFilterService {
  constructor(private canvasService: CanvasService) {}
  
  // Methods
  async applyBilateralFilter(
    sourceCanvas: HTMLCanvasElement, 
    sigmaSpace: number, 
    sigmaColor: number,
    progressCallback?: (progress: number) => void
  ): Promise<HTMLCanvasElement>
  
  private bilateralFilterKernel(
    imageData: ImageData, 
    x: number, 
    y: number, 
    sigmaSpace: number, 
    sigmaColor: number
  ): [number, number, number]
  
  private gaussianWeight(distance: number, sigma: number): number
  private colorDistance(rgb1: [number, number, number], rgb2: [number, number, number]): number
}
```

#### QuantizationService
```typescript
@Injectable({
  providedIn: 'root'
})
export class QuantizationService {
  private rgbQuantInstance: any; // RgbQuant.js instance
  
  constructor(private canvasService: CanvasService) {}
  
  // Methods
  async quantizeImage(
    sourceCanvas: HTMLCanvasElement,
    colorCount: number,
    method: number,
    progressCallback?: (progress: number) => void
  ): Promise<{canvas: HTMLCanvasElement, palette: number[][]}>
  
  private initializeRgbQuant(options: any): any
  extractPalette(canvas: HTMLCanvasElement, colorCount: number): number[][]
}
```

#### DitheringService
```typescript
@Injectable({
  providedIn: 'root'
})
export class DitheringService {
  private ditheringKernels: Map<DitheringType, number[][]>;
  
  constructor(private canvasService: CanvasService) {
    this.initializeDitheringKernels();
  }
  
  // Methods
  async applyDithering(
    sourceCanvas: HTMLCanvasElement,
    palette: number[][],
    algorithm: DitheringType,
    strength: number,
    progressCallback?: (progress: number) => void
  ): Promise<HTMLCanvasElement>
  
  private initializeDitheringKernels(): void
  private findClosestColor(pixel: [number, number, number], palette: number[][]): number[]
  private applyErrorDiffusion(imageData: ImageData, kernel: number[][], palette: number[][]): void
}
```

#### CanvasService
```typescript
@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  // Methods
  createCanvas(width: number, height: number): HTMLCanvasElement
  copyCanvas(source: HTMLCanvasElement): HTMLCanvasElement
  imageToCanvas(image: HTMLImageElement): HTMLCanvasElement
  canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob>
  downloadCanvas(canvas: HTMLCanvasElement, filename: string): void
  resizeCanvas(canvas: HTMLCanvasElement, maxWidth: number, maxHeight: number): HTMLCanvasElement
  
  private getImageData(canvas: HTMLCanvasElement): ImageData
  private putImageData(canvas: HTMLCanvasElement, imageData: ImageData): void
}
```

#### FileService
```typescript
@Injectable({
  providedIn: 'root'
})
export class FileService {
  // Methods
  validateImageFile(file: File): {valid: boolean, error?: string}
  loadImageFromFile(file: File): Promise<HTMLImageElement>
  downloadImage(canvas: HTMLCanvasElement, filename: string, format: string): void
  getFileSizeString(bytes: number): string
  
  private readonly SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
}
```

## Processing Pipeline Flow

```
1. User uploads image → ImageUploadComponent
   ↓
2. File validation → FileService.validateImageFile()
   ↓
3. Image loading → FileService.loadImageFromFile()
   ↓
4. Canvas creation → CanvasService.imageToCanvas()
   ↓
5. User adjusts parameters → ParameterControlComponent
   ↓
6. Processing starts → ImageProcessingService.processImage()
   ↓
7. Bilateral filtering → BilateralFilterService.applyBilateralFilter()
   ↓
8. Color quantization → QuantizationService.quantizeImage()
   ↓
9. Dithering application → DitheringService.applyDithering()
   ↓
10. Results display → ImageResultsComponent
    ↓
11. Download options → FileService.downloadImage()
```

## State Management

### Application State
```typescript
interface AppState {
  currentImage: ImageData | null;
  processingParameters: ProcessingParameters;
  processingProgress: ProcessingProgress | null;
  isProcessing: boolean;
  errorMessage: string | null;
}
```

The state will be managed through services with RxJS observables for reactive updates across components.

## Performance Considerations

1. **Web Workers**: Move heavy processing (bilateral filter, quantization) to Web Workers
2. **Progressive Processing**: Update UI with intermediate results
3. **Canvas Optimization**: Reuse canvas elements, optimize ImageData operations
4. **Memory Management**: Proper cleanup of large ImageData objects
5. **Responsive Updates**: Debounced parameter changes to avoid excessive processing

## Error Handling Strategy

1. **File Validation**: Comprehensive file type and size validation
2. **Processing Errors**: Graceful error handling with user-friendly messages
3. **Memory Errors**: Detection and handling of out-of-memory situations
4. **Cancellation**: Proper cleanup when users cancel processing
5. **Browser Compatibility**: Fallbacks for unsupported features

This architecture provides a solid foundation for the Angular application with clear separation of concerns, reactive data flow, and extensibility for future enhancements.