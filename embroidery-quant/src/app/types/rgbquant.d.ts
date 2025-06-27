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
    sample(input: HTMLCanvasElement | HTMLImageElement | ImageData): void;
    palette(tuples?: boolean): number[][] | Uint8Array;
    reduce(input: HTMLCanvasElement | HTMLImageElement | ImageData, retType?: number): Uint8Array | number[] | ImageData;
    buildPal(): void;
  }

  interface RgbQuantConstructor {
    new (options: RgbQuantOptions): RgbQuantInstance;
  }

  const RgbQuant: RgbQuantConstructor;
  export = RgbQuant;
}