declare module 'rgbquant' {
  interface RgbQuantOptions {
    colors?: number;
    method?: number;
    boxSize?: [number, number];
    boxPxls?: number;
    initColors?: number;
    minHueCols?: number;
    dithKern?: string | null;
    dithDelta?: number;
    dithSerp?: boolean;
    palette?: number[][];
    reIndex?: boolean;
    useCache?: boolean;
    cacheFreq?: number;
    colorDist?: string;
  }

  interface RgbQuantInstance {
    sample(canvas: HTMLCanvasElement | HTMLImageElement): void;
    palette(tuples?: boolean): number[][] | Uint8Array;
    reduce(canvas: HTMLCanvasElement | HTMLImageElement, retType?: number): Uint8Array | number[] | ImageData;
    buildPal(): void;
  }

  interface RgbQuantConstructor {
    new (options: RgbQuantOptions): RgbQuantInstance;
  }

  const RgbQuant: RgbQuantConstructor;
  export = RgbQuant;
}