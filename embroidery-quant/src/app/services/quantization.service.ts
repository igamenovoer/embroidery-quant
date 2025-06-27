import { Injectable } from '@angular/core';
import { QuantizationConfig, DitheringAlgorithm, Color } from '../models/processing.models';

interface QuantizedResult {
  imageData: ImageData;
  palette: Color[];
  processingTime: number;
}

interface QuantizerInstance {
  quantizer: any;
  config: QuantizationConfig;
  palette: Color[];
}

declare global {
  interface Window {
    RgbQuant: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class QuantizationService {
  private currentQuantizer: QuantizerInstance | null = null;

  constructor() {}

  private getRgbQuant(): any {
    if (typeof window !== 'undefined' && window.RgbQuant) {
      return window.RgbQuant;
    }
    throw new Error('RgbQuant library not loaded');
  }

  /**
   * Build palette from reference image (usually the original image)
   * This creates a quantizer instance that can be reused for multiple images
   */
  async buildPaletteFromReference(referenceImageData: ImageData, config: QuantizationConfig): Promise<Color[]> {
    const startTime = performance.now();
    
    try {
      console.log('Building palette from reference image with', config.colorCount, 'colors');
      
      const optimizedConfig = config.embroideryOptimized ? 
        this.optimizeForEmbroidery(config) : config;

      // Create RgbQuant instance with proper options
      const RgbQuant = this.getRgbQuant();
      const opts = {
        colors: optimizedConfig.colorCount,
        method: optimizedConfig.method,
        boxSize: [64, 64],
        boxPxls: 2,
        initColors: optimizedConfig.initColors || 4096,
        minHueCols: optimizedConfig.minHueColors || 0,
        dithKern: this.getDitheringKernel(optimizedConfig.ditheringAlgorithm),
        dithDelta: optimizedConfig.ditheringIntensity || 0,
        dithSerp: optimizedConfig.serpentineMode || false,
        useCache: true,
        cacheFreq: 10,
        colorDist: 'euclidean'
      };

      const quantizer = new RgbQuant(opts);
      
      // Sample ONLY the reference image to build color statistics
      // Pass ImageData directly to RgbQuant (like in working demo)
      quantizer.sample(referenceImageData);
      
      // Get the palette (this builds it internally)
      const palette = quantizer.palette(true); // Get as RGB tuples
      console.log('Generated palette with', palette.length, 'colors');
      
      const convertedPalette = this.convertPalette(palette);
      
      // Store the quantizer instance for reuse
      this.currentQuantizer = {
        quantizer,
        config: optimizedConfig,
        palette: convertedPalette
      };

      const processingTime = performance.now() - startTime;
      console.log('Palette building completed in', processingTime, 'ms');

      return convertedPalette;
    } catch (error) {
      console.error('Palette building failed:', error);
      throw error;
    }
  }

  /**
   * Quantize an image using existing palette (must call buildPaletteFromReference first)
   * This allows multiple images to be quantized with the same palette for consistency
   */
  async quantizeWithExistingPalette(imageData: ImageData): Promise<QuantizedResult> {
    const startTime = performance.now();
    
    try {
      if (!this.currentQuantizer) {
        throw new Error('No palette available. Call buildPaletteFromReference() first.');
      }

      console.log('Quantizing image with existing palette of', this.currentQuantizer.palette.length, 'colors');

      // Use the existing quantizer (which already has the palette built)
      // Pass ImageData directly to RgbQuant (like in working demo)
      const quantizedBuffer = this.currentQuantizer.quantizer.reduce(imageData, 1); // Get Uint8Array
      
      // Convert buffer back to ImageData
      const quantizedImageData = new ImageData(
        new Uint8ClampedArray(quantizedBuffer),
        imageData.width,
        imageData.height
      );

      const processingTime = performance.now() - startTime;

      console.log('Quantization completed in', processingTime, 'ms');

      return {
        imageData: quantizedImageData,
        palette: this.currentQuantizer.palette,
        processingTime
      };
    } catch (error) {
      console.error('Quantization failed:', error);
      console.error('Error stack:', error);
      throw error;
    }
  }

  /**
   * Legacy method - builds palette and quantizes in one step
   * Use buildPaletteFromReference + quantizeWithExistingPalette for better control
   */
  async quantizeImage(imageData: ImageData, config: QuantizationConfig): Promise<QuantizedResult> {
    // Build palette from this image
    await this.buildPaletteFromReference(imageData, config);
    
    // Quantize using the built palette
    return this.quantizeWithExistingPalette(imageData);
  }

  async generatePalette(imageData: ImageData, colorCount: number): Promise<Color[]> {
    const config = new QuantizationConfig({
      colorCount,
      method: 2,
      ditheringAlgorithm: DitheringAlgorithm.None,
      embroideryOptimized: false
    });
    
    return this.buildPaletteFromReference(imageData, config);
  }

  async applyCustomPalette(imageData: ImageData, palette: Color[]): Promise<ImageData> {
    const RgbQuant = this.getRgbQuant();
    const rgbPalette = palette.map(color => [color.r, color.g, color.b]);
    
    const opts = {
      colors: palette.length,
      method: 2,
      palette: rgbPalette,
      dithKern: null,
      dithDelta: 0,
      dithSerp: false
    };

    const quantizer = new RgbQuant(opts);
    
    // Pass ImageData directly to RgbQuant
    const resultBuffer = quantizer.reduce(imageData, 1); // Get Uint8Array
    
    return new ImageData(
      new Uint8ClampedArray(resultBuffer),
      imageData.width,
      imageData.height
    );
  }

  /**
   * Get the current palette if available
   */
  getCurrentPalette(): Color[] | null {
    return this.currentQuantizer?.palette || null;
  }

  /**
   * Check if a quantizer with palette is available
   */
  hasPalette(): boolean {
    return this.currentQuantizer !== null;
  }

  /**
   * Clear the current quantizer instance
   */
  clearPalette(): void {
    this.currentQuantizer = null;
  }

  /**
   * Simple direct quantization for debugging - mimics working HTML demo exactly
   * Uses HTMLImageElement like the working examples do
   */
  async quantizeImageDirectlyFromElement(imageElement: HTMLImageElement, colorCount: number = 16): Promise<QuantizedResult> {
    const startTime = performance.now();
    
    try {
      console.log('=== TESTING DIRECT QUANTIZATION FROM IMAGE ELEMENT ===');
      console.log('Direct quantization with', colorCount, 'colors');
      console.log('Image element dimensions:', imageElement.width, 'x', imageElement.height);
      console.log('Image element src length:', imageElement.src.length);

      // Create RgbQuant with minimal options (exactly like working demo)
      const RgbQuant = this.getRgbQuant();
      const opts = {
        colors: colorCount
      };

      console.log('Creating RgbQuant with options:', opts);
      const quantizer = new RgbQuant(opts);
      
      console.log('Sampling image element directly...');
      // Pass HTMLImageElement directly like working examples
      quantizer.sample(imageElement);
      
      console.log('Getting palette...');
      const paletteData = quantizer.palette();
      console.log('Palette generated:', paletteData);
      
      // Create canvas to get ImageData for processing
      console.log('Creating canvas for image data...');
      const canvas = document.createElement('canvas');
      canvas.width = imageElement.width;
      canvas.height = imageElement.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(imageElement, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      console.log('Reducing image...');
      const quantizedBuffer = quantizer.reduce(imageElement);
      console.log('Quantized buffer type:', typeof quantizedBuffer);
      console.log('Quantized buffer length:', quantizedBuffer.length);
      
      // Convert buffer back to ImageData
      const quantizedImageData = new ImageData(
        new Uint8ClampedArray(quantizedBuffer),
        imageElement.width,
        imageElement.height
      );

      const processingTime = performance.now() - startTime;
      console.log('Direct quantization completed in', processingTime, 'ms');

      // Convert palette for return (handle different palette formats)
      let palette: Color[] = [];
      
      if (Array.isArray(paletteData) && paletteData[0] && Array.isArray(paletteData[0])) {
        // RGB tuples format [[r,g,b], [r,g,b], ...]
        palette = paletteData.map((rgb: number[]) => new Color(rgb[0], rgb[1], rgb[2]));
      } else if (paletteData instanceof Uint8Array) {
        // Uint8Array format [r,g,b,a,r,g,b,a,...]
        for (let i = 0; i < paletteData.length; i += 4) {
          palette.push(new Color(paletteData[i], paletteData[i + 1], paletteData[i + 2]));
        }
      }

      console.log('Final palette length:', palette.length);

      return {
        imageData: quantizedImageData,
        palette,
        processingTime
      };
    } catch (error) {
      console.error('=== DIRECT QUANTIZATION FROM ELEMENT FAILED ===', error);
      console.error('Error stack:', (error as Error).stack);
      throw error;
    }
  }

  async applyDithering(imageData: ImageData, algorithm: DitheringAlgorithm, palette: Color[]): Promise<ImageData> {
    if (algorithm === DitheringAlgorithm.None) {
      return this.applyCustomPalette(imageData, palette);
    }

    const rgbPalette = palette.map(color => [color.r, color.g, color.b]);
    
    const opts = {
      colors: palette.length,
      method: 2,
      boxSize: [64, 64] as [number, number],
      boxPxls: 2,
      initColors: 4096,
      minHueCols: 0,
      palette: rgbPalette,
      dithKern: this.getDitheringKernel(algorithm),
      dithDelta: 0.05,
      dithSerp: true,
      useCache: true,
      cacheFreq: 10,
      colorDist: 'euclidean'
    };

    console.log('Applying dithering with algorithm:', algorithm, 'and options:', opts);

    const RgbQuant = this.getRgbQuant();
    const quantizer = new RgbQuant(opts);
    
    // For dithering with preset palette, we still need to sample first
    // This is important for RgbQuant to work correctly
    quantizer.sample(imageData);
    const resultBuffer = quantizer.reduce(imageData, 1); // Get Uint8Array
    
    return new ImageData(
      new Uint8ClampedArray(resultBuffer),
      imageData.width,
      imageData.height
    );
  }

  getEmbroideryPresets(): QuantizationConfig[] {
    return [
      new QuantizationConfig({
        colorCount: 8,
        method: 2,
        ditheringAlgorithm: DitheringAlgorithm.FloydSteinberg,
        ditheringIntensity: 0.03,
        serpentineMode: true,
        minHueColors: 2,
        embroideryOptimized: true
      }),
      new QuantizationConfig({
        colorCount: 16,
        method: 2,
        ditheringAlgorithm: DitheringAlgorithm.Atkinson,
        ditheringIntensity: 0.05,
        serpentineMode: true,
        minHueColors: 2,
        embroideryOptimized: true
      }),
      new QuantizationConfig({
        colorCount: 32,
        method: 2,
        ditheringAlgorithm: DitheringAlgorithm.FloydSteinberg,
        ditheringIntensity: 0.08,
        serpentineMode: true,
        minHueColors: 3,
        embroideryOptimized: true
      })
    ];
  }

  optimizeForEmbroidery(config: QuantizationConfig): QuantizationConfig {
    const optimized = new QuantizationConfig(config);
    
    optimized.method = 2;
    optimized.minHueColors = Math.max(2, Math.floor(config.colorCount / 8));
    
    if (config.colorCount <= 16) {
      optimized.ditheringIntensity = Math.min(0.05, config.ditheringIntensity);
    }
    
    optimized.serpentineMode = true;
    
    return optimized;
  }


  private getDitheringKernel(algorithm: DitheringAlgorithm): string | null {
    const kernelMap: Record<DitheringAlgorithm, string | null> = {
      [DitheringAlgorithm.None]: null,
      [DitheringAlgorithm.FloydSteinberg]: 'FloydSteinberg',
      [DitheringAlgorithm.Atkinson]: 'Atkinson',
      [DitheringAlgorithm.Burkes]: 'Burkes',
      [DitheringAlgorithm.Stucki]: 'Stucki',
      [DitheringAlgorithm.Sierra2]: 'TwoSierra',  // Maps to TwoSierra in RgbQuant
      [DitheringAlgorithm.Sierra3]: 'Sierra',     // Maps to Sierra in RgbQuant  
      [DitheringAlgorithm.SierraLite]: 'SierraLite'
    };

    return kernelMap[algorithm] || null;
  }

  private convertPalette(rgbQuantPalette: number[][]): Color[] {
    return rgbQuantPalette.map(rgb => new Color(rgb[0], rgb[1], rgb[2]));
  }

  private async fallbackQuantization(imageData: ImageData, config: QuantizationConfig): Promise<QuantizedResult> {
    const startTime = performance.now();
    
    const palette = await this.fallbackPaletteGeneration(imageData, config.colorCount);
    const quantizedImageData = await this.fallbackApplyPalette(imageData, palette);
    
    const processingTime = performance.now() - startTime;
    
    return {
      imageData: quantizedImageData,
      palette,
      processingTime
    };
  }

  private fallbackPaletteGeneration(imageData: ImageData, colorCount: number): Promise<Color[]> {
    return new Promise((resolve) => {
      const data = imageData.data;
      
      const colorMap = new Map<string, { color: Color; count: number }>();
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const key = `${r},${g},${b}`;
        
        if (colorMap.has(key)) {
          colorMap.get(key)!.count++;
        } else {
          colorMap.set(key, { color: new Color(r, g, b), count: 1 });
        }
      }
      
      const sortedColors = Array.from(colorMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, colorCount)
        .map(item => item.color);
      
      resolve(sortedColors);
    });
  }

  private fallbackApplyPalette(imageData: ImageData, palette: Color[]): Promise<ImageData> {
    return new Promise((resolve) => {
      const output = new ImageData(imageData.width, imageData.height);
      const data = imageData.data;
      const outData = output.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        const currentColor = new Color(r, g, b, a);
        const nearestColor = this.findNearestColor(currentColor, palette);
        
        outData[i] = nearestColor.r;
        outData[i + 1] = nearestColor.g;
        outData[i + 2] = nearestColor.b;
        outData[i + 3] = a;
      }
      
      resolve(output);
    });
  }


  private findNearestColor(color: Color, palette: Color[]): Color {
    let minDistance = Infinity;
    let nearestColor = palette[0];
    
    for (const paletteColor of palette) {
      const distance = color.distance(paletteColor);
      if (distance < minDistance) {
        minDistance = distance;
        nearestColor = paletteColor;
      }
    }
    
    return nearestColor;
  }

  private distributeError(
    data: Float32Array,
    width: number,
    height: number,
    x: number,
    y: number,
    errorR: number,
    errorG: number,
    errorB: number,
    algorithm: DitheringAlgorithm
  ): void {
    const distributionMatrix = this.getErrorDistributionMatrix(algorithm);
    
    for (const [dx, dy, factor] of distributionMatrix) {
      const nx = x + dx;
      const ny = y + dy;
      
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const idx = (ny * width + nx) * 4;
        data[idx] += errorR * factor;
        data[idx + 1] += errorG * factor;
        data[idx + 2] += errorB * factor;
      }
    }
  }

  private getErrorDistributionMatrix(algorithm: DitheringAlgorithm): [number, number, number][] {
    switch (algorithm) {
      case DitheringAlgorithm.FloydSteinberg:
        return [
          [1, 0, 7/16],
          [-1, 1, 3/16],
          [0, 1, 5/16],
          [1, 1, 1/16]
        ];
      case DitheringAlgorithm.Atkinson:
        return [
          [1, 0, 1/8],
          [2, 0, 1/8],
          [-1, 1, 1/8],
          [0, 1, 1/8],
          [1, 1, 1/8],
          [0, 2, 1/8]
        ];
      default:
        return [[1, 0, 0.5], [0, 1, 0.5]];
    }
  }
}