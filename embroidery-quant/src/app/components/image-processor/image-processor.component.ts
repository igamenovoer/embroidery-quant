import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material Components
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Services
import { CanvasService } from '../../services/canvas.service';
import { BilateralFilterService } from '../../services/bilateral-filter.service';
import { QuantizationService } from '../../services/quantization.service';

// Models
import { 
  BilateralParams, 
  QuantizationConfig, 
  DitheringAlgorithm, 
  Color 
} from '../../models/processing.models';

interface DitheringOption {
  label: string;
  value: DitheringAlgorithm;
}

@Component({
  selector: 'app-image-processor',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatSliderModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatTabsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './image-processor.component.html',
  styleUrl: './image-processor.component.scss'
})
export class ImageProcessorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() imageFile: File | null = null;

  // Canvas elements
  originalCanvas!: HTMLCanvasElement;
  filteredCanvas!: HTMLCanvasElement;
  quantizedCanvas!: HTMLCanvasElement;
  finalCanvas!: HTMLCanvasElement;

  // Processing state
  isProcessing = false;
  processingStage = '';
  processingTime = 0;
  
  // UI state
  selectedTabIndex = 0;
  
  // Debounce timer for parameter changes
  private debounceTimer: any;

  // Bilateral filter parameters
  bilateralParams = new BilateralParams();
  
  // Quantization parameters
  quantizationConfig = new QuantizationConfig();
  
  // UI options
  ditheringOptions: DitheringOption[] = [
    { label: 'None', value: DitheringAlgorithm.None },
    { label: 'Floyd-Steinberg', value: DitheringAlgorithm.FloydSteinberg },
    { label: 'Atkinson', value: DitheringAlgorithm.Atkinson },
    { label: 'Burkes', value: DitheringAlgorithm.Burkes },
    { label: 'Stucki', value: DitheringAlgorithm.Stucki },
    { label: 'Sierra 2', value: DitheringAlgorithm.Sierra2 },
    { label: 'Sierra 3', value: DitheringAlgorithm.Sierra3 },
    { label: 'Sierra Lite', value: DitheringAlgorithm.SierraLite }
  ];

  // Results
  originalImageData: ImageData | null = null;
  filteredImageData: ImageData | null = null;
  quantizedImageData: ImageData | null = null;
  finalImageData: ImageData | null = null;
  palette: Color[] = [];

  constructor(
    private canvasService: CanvasService,
    private bilateralFilterService: BilateralFilterService,
    private quantizationService: QuantizationService
  ) {}

  ngOnInit(): void {
    this.setupCanvases();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageFile'] && this.imageFile) {
      this.loadImage();
    }
  }

  private setupCanvases(): void {
    // Initialize canvas elements
    this.originalCanvas = document.createElement('canvas');
    this.filteredCanvas = document.createElement('canvas');
    this.quantizedCanvas = document.createElement('canvas');
    this.finalCanvas = document.createElement('canvas');
  }

  private async loadImage(): Promise<void> {
    if (!this.imageFile) return;

    try {
      this.isProcessing = true;
      this.processingStage = 'Loading image...';

      // Load image element
      const imageElement = await this.canvasService.loadImageFromFile(this.imageFile);
      
      // Convert to canvas and then to ImageData
      const canvas = await this.canvasService.imageToCanvas(imageElement);
      this.originalImageData = this.canvasService.canvasToImageData(canvas);

      // Set canvas dimensions
      const { width, height } = this.originalImageData;
      [this.originalCanvas, this.filteredCanvas, this.quantizedCanvas, this.finalCanvas]
        .forEach(canvasElement => {
          canvasElement.width = width;
          canvasElement.height = height;
        });

      // Draw original image
      const originalCtx = this.originalCanvas.getContext('2d')!;
      originalCtx.putImageData(this.originalImageData, 0, 0);

      // Process the image pipeline
      await this.processImagePipeline();

    } catch (error) {
      console.error('Error loading image:', error);
    } finally {
      this.isProcessing = false;
      this.processingStage = '';
    }
  }

  async processImagePipeline(): Promise<void> {
    if (!this.originalImageData) return;

    const startTime = performance.now();
    
    try {
      this.isProcessing = true;

      // Stage 1: Apply bilateral filter
      this.processingStage = 'Applying bilateral filter...';
      this.filteredImageData = await this.bilateralFilterService.applyFilter(
        this.originalImageData,
        this.bilateralParams
      );
      
      const filteredCtx = this.filteredCanvas.getContext('2d')!;
      filteredCtx.putImageData(this.filteredImageData, 0, 0);

      // Stage 2: Quantize image (without dithering)
      this.processingStage = 'Quantizing colors...';
      const quantResult = await this.quantizationService.quantizeImage(
        this.filteredImageData,
        { ...this.quantizationConfig, ditheringAlgorithm: DitheringAlgorithm.None }
      );
      
      this.quantizedImageData = quantResult.imageData;
      this.palette = quantResult.palette;
      
      const quantizedCtx = this.quantizedCanvas.getContext('2d')!;
      quantizedCtx.putImageData(this.quantizedImageData, 0, 0);

      // Stage 3: Apply dithering if selected
      this.processingStage = 'Applying dithering...';
      if (this.quantizationConfig.ditheringAlgorithm !== DitheringAlgorithm.None) {
        this.finalImageData = await this.quantizationService.applyDithering(
          this.filteredImageData,
          this.quantizationConfig.ditheringAlgorithm,
          this.palette
        );
      } else {
        this.finalImageData = this.quantizedImageData;
      }

      const finalCtx = this.finalCanvas.getContext('2d')!;
      finalCtx.putImageData(this.finalImageData, 0, 0);

      this.processingTime = performance.now() - startTime;

    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      this.isProcessing = false;
      this.processingStage = '';
    }
  }

  async onBilateralParamsChange(): Promise<void> {
    console.log('Bilateral params changed:', this.bilateralParams);
    console.log('Original image data exists:', !!this.originalImageData);
    console.log('Is processing:', this.isProcessing);
    
    if (this.originalImageData && !this.isProcessing) {
      console.log('Starting image processing pipeline...');
      await this.processImagePipeline();
    } else {
      console.log('Skipping processing - missing image data or already processing');
    }
  }

  async onQuantizationConfigChange(): Promise<void> {
    console.log('Quantization config changed:', this.quantizationConfig);
    console.log('Original image data exists:', !!this.originalImageData);
    console.log('Is processing:', this.isProcessing);
    
    if (this.originalImageData && !this.isProcessing) {
      console.log('Starting image processing pipeline...');
      await this.processImagePipeline();
    } else {
      console.log('Skipping processing - missing image data or already processing');
    }
  }

  async onSliderChange(): Promise<void> {
    console.log('Slider changed');
    
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // Debounce the processing to avoid too many rapid updates
    this.debounceTimer = setTimeout(async () => {
      await this.onBilateralParamsChange();
    }, 300); // 300ms delay
  }

  async onSelectChange(): Promise<void> {
    console.log('Select changed');
    await this.onQuantizationConfigChange();
  }

  async downloadResult(): Promise<void> {
    if (!this.finalCanvas) return;

    const link = document.createElement('a');
    link.download = 'embroidery-pattern.png';
    link.href = this.finalCanvas.toDataURL();
    link.click();
  }

  resetToDefaults(): void {
    this.bilateralParams = new BilateralParams();
    this.quantizationConfig = new QuantizationConfig();
    if (this.originalImageData) {
      this.processImagePipeline();
    }
  }

  getCanvasDataUrl(canvas: HTMLCanvasElement): string {
    return canvas?.toDataURL() || '';
  }

  getDitheringLabel(): string {
    const option = this.ditheringOptions.find(opt => opt.value === this.quantizationConfig.ditheringAlgorithm);
    return option?.label || 'None';
  }

  formatSliderValue(value: number): string {
    return `${value}`;
  }

  formatPercentage(value: number): string {
    return `${(value * 100).toFixed(0)}%`;
  }

  onTabChanged(index: number): void {
    this.selectedTabIndex = index;
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}