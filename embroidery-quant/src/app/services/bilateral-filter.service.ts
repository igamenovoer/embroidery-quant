import { Injectable } from '@angular/core';
import { BilateralParams } from '../models/processing.models';

@Injectable({
  providedIn: 'root'
})
export class BilateralFilterService {

  async applyFilter(imageData: ImageData, params: BilateralParams): Promise<ImageData> {
    if (!this.validateParameters(params)) {
      throw new Error('Invalid bilateral filter parameters');
    }

    const shouldUseWorker = this.shouldUseWebWorker(imageData.width * imageData.height);
    
    if (shouldUseWorker && typeof Worker !== 'undefined') {
      return this.processWithWebWorker(imageData, params);
    } else {
      return this.processSync(imageData, params);
    }
  }

  async generatePreview(imageData: ImageData, params: BilateralParams): Promise<ImageData> {
    const maxPreviewSize = 512;
    const scale = Math.min(maxPreviewSize / imageData.width, maxPreviewSize / imageData.height, 1);
    
    if (scale < 1) {
      const scaledImageData = this.scaleImageData(imageData, scale);
      const filteredScaled = await this.processSync(scaledImageData, params);
      return this.scaleImageData(filteredScaled, 1 / scale);
    }
    
    return this.processSync(imageData, params);
  }

  validateParameters(params: BilateralParams): boolean {
    return params.sigmaSpace > 0 && 
           params.sigmaColor > 0 && 
           params.kernelSize > 0 && 
           params.kernelSize % 2 === 1 &&
           params.iterations > 0;
  }

  getOptimalParameters(imageData: ImageData): BilateralParams {
    const pixelCount = imageData.width * imageData.height;
    
    if (pixelCount > 1000000) {
      return new BilateralParams(10, 25, 7, 1);
    } else if (pixelCount > 500000) {
      return new BilateralParams(12, 30, 9, 1);
    } else {
      return new BilateralParams(15, 35, 11, 1);
    }
  }

  private processSync(imageData: ImageData, params: BilateralParams): Promise<ImageData> {
    return new Promise((resolve) => {
      const result = this.bilateralFilterCore(imageData, params);
      resolve(result);
    });
  }

  private async processWithWebWorker(imageData: ImageData, params: BilateralParams): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('../workers/bilateral-filter.worker', import.meta.url));
      
      worker.postMessage({
        imageData: {
          data: imageData.data,
          width: imageData.width,
          height: imageData.height
        },
        params
      });

      worker.onmessage = (e) => {
        const result = new ImageData(
          new Uint8ClampedArray(e.data.data),
          e.data.width,
          e.data.height
        );
        worker.terminate();
        resolve(result);
      };

      worker.onerror = (error) => {
        worker.terminate();
        reject(error);
      };

      setTimeout(() => {
        worker.terminate();
        reject(new Error('Worker timeout'));
      }, 30000);
    });
  }

  private bilateralFilterCore(imageData: ImageData, params: BilateralParams): ImageData {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data.length);
    const radius = Math.floor(params.kernelSize / 2);
    
    const sigmaSpaceSq = params.sigmaSpace * params.sigmaSpace;
    const sigmaColorSq = params.sigmaColor * params.sigmaColor;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const centerIdx = (y * width + x) * 4;
        const centerR = data[centerIdx];
        const centerG = data[centerIdx + 1];
        const centerB = data[centerIdx + 2];
        const centerA = data[centerIdx + 3];

        let weightSum = 0;
        let rSum = 0, gSum = 0, bSum = 0, aSum = 0;

        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const ny = y + ky;
            const nx = x + kx;

            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              const neighborIdx = (ny * width + nx) * 4;
              const neighborR = data[neighborIdx];
              const neighborG = data[neighborIdx + 1];
              const neighborB = data[neighborIdx + 2];
              const neighborA = data[neighborIdx + 3];

              const spatialDist = kx * kx + ky * ky;
              const spatialWeight = Math.exp(-spatialDist / (2 * sigmaSpaceSq));

              const colorDist = Math.pow(centerR - neighborR, 2) + 
                              Math.pow(centerG - neighborG, 2) + 
                              Math.pow(centerB - neighborB, 2);
              const colorWeight = Math.exp(-colorDist / (2 * sigmaColorSq));

              const weight = spatialWeight * colorWeight;
              weightSum += weight;

              rSum += neighborR * weight;
              gSum += neighborG * weight;
              bSum += neighborB * weight;
              aSum += neighborA * weight;
            }
          }
        }

        if (weightSum > 0) {
          output[centerIdx] = Math.round(rSum / weightSum);
          output[centerIdx + 1] = Math.round(gSum / weightSum);
          output[centerIdx + 2] = Math.round(bSum / weightSum);
          output[centerIdx + 3] = Math.round(aSum / weightSum);
        } else {
          output[centerIdx] = centerR;
          output[centerIdx + 1] = centerG;
          output[centerIdx + 2] = centerB;
          output[centerIdx + 3] = centerA;
        }
      }
    }

    return new ImageData(output, width, height);
  }

  private scaleImageData(imageData: ImageData, scale: number): ImageData {
    const newWidth = Math.round(imageData.width * scale);
    const newHeight = Math.round(imageData.height * scale);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
    
    const scaledCanvas = document.createElement('canvas');
    const scaledCtx = scaledCanvas.getContext('2d')!;
    scaledCanvas.width = newWidth;
    scaledCanvas.height = newHeight;
    
    scaledCtx.imageSmoothingEnabled = true;
    scaledCtx.imageSmoothingQuality = 'high';
    scaledCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
    
    return scaledCtx.getImageData(0, 0, newWidth, newHeight);
  }

  private shouldUseWebWorker(pixelCount: number): boolean {
    return pixelCount > 262144; // 512x512 pixels
  }
}