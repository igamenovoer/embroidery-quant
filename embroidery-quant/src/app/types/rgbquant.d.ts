declare var RgbQuant: {
  new (options: RgbQuantOptions): RgbQuantInstance;
};

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
  sample(canvas: HTMLCanvasElement): void;
  palette(): number[][];
  reduce(canvas: HTMLCanvasElement): ImageData;
}