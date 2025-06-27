export interface ImageData {
  originalFile: File;
  originalCanvas: HTMLCanvasElement;
  filteredCanvas?: HTMLCanvasElement;
  quantizedCanvas?: HTMLCanvasElement;
  ditheredCanvas?: HTMLCanvasElement;
  width: number;
  height: number;
}

export interface ProcessingParameters {
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

export enum DitheringType {
  NONE = 'none',
  FLOYD_STEINBERG = 'FloydSteinberg',
  ATKINSON = 'Atkinson',
  BURKES = 'Burkes',
  STUCKI = 'Stucki',
  SIERRA = 'Sierra'
}

export interface ProcessingProgress {
  stage: ProcessingStage;
  progress: number;       // 0-100
  message: string;
  canCancel: boolean;
}

export enum ProcessingStage {
  UPLOADING = 'uploading',
  FILTERING = 'filtering',
  QUANTIZING = 'quantizing',
  DITHERING = 'dithering',
  COMPLETE = 'complete',
  ERROR = 'error'
}

export const DEFAULT_PROCESSING_PARAMETERS: ProcessingParameters = {
  sigmaSpace: 15,
  sigmaColor: 30,
  colorCount: 16,
  method: 2,
  ditheringAlgorithm: DitheringType.FLOYD_STEINBERG,
  ditheringStrength: 1.0
};