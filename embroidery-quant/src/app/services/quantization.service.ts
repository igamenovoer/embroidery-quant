import { Injectable } from '@angular/core';
import { QuantizationConfig, DitheringAlgorithm, Color } from '../models/processing.models';

interface QuantizedResult {
  imageData: ImageData;
  palette: Color[];
  processingTime: number;
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
  constructor() {}

  private getRgbQuant(): any {
    if (typeof window !== 'undefined' && window.RgbQuant) {
      return window.RgbQuant;
    }
    throw new Error('RgbQuant library not loaded');
  }

  async quantizeImage(imageData: ImageData, config: QuantizationConfig): Promise<QuantizedResult> {
    const startTime = performance.now();
    
    try {
      console.log('Starting quantization with', config.colorCount, 'colors');
      
      const optimizedConfig = config.embroideryOptimized ? 
        this.optimizeForEmbroidery(config) : config;

      // Create canvas from ImageData
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(imageData, 0, 0);

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
      
      // Step 1: Sample the image to build color statistics
      quantizer.sample(canvas);
      
      // Step 2: Get the palette
      const palette = quantizer.palette(true); // Get as RGB tuples
      console.log('Generated palette with', palette.length, 'colors');
      
      // Step 3: Reduce the image using the built palette
      const quantizedBuffer = quantizer.reduce(canvas, 1); // Get Uint8Array
      
      // Convert buffer back to ImageData
      const quantizedImageData = new ImageData(
        new Uint8ClampedArray(quantizedBuffer),
        canvas.width,
        canvas.height
      );

      const processingTime = performance.now() - startTime;

      console.log('Quantization completed in', processingTime, 'ms');

      return {
        imageData: quantizedImageData,
        palette: this.convertPalette(palette),
        processingTime
      };
    } catch (error) {
      console.error('Quantization failed:', error);
      console.error('Error stack:', error);
      return this.fallbackQuantization(imageData, config);
    }
  }

  async generatePalette(imageData: ImageData, colorCount: number): Promise<Color[]> {
    const RgbQuant = this.getRgbQuant();
    const opts = {
      colors: colorCount,
      method: 2,
      boxSize: [64, 64],
      boxPxls: 2,
      initColors: 4096,
      minHueCols: 0,
      dithKern: null,
      dithDelta: 0,
      dithSerp: false,
      useCache: true,
      cacheFreq: 10,
      colorDist: 'euclidean'
    };

    const quantizer = new RgbQuant(opts);
    
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);

    quantizer.sample(canvas);
    const palette = quantizer.palette(true); // Get as RGB tuples
    
    return this.convertPalette(palette);
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
    
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);

    const resultBuffer = quantizer.reduce(canvas, 1); // Get Uint8Array
    
    return new ImageData(
      new Uint8ClampedArray(resultBuffer),
      canvas.width,
      canvas.height
    );
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
    
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);

    // For dithering with preset palette, we still need to sample first
    // This is important for RgbQuant to work correctly
    quantizer.sample(canvas);
    const resultBuffer = quantizer.reduce(canvas, 1); // Get Uint8Array
    
    return new ImageData(
      new Uint8ClampedArray(resultBuffer),
      canvas.width,
      canvas.height
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