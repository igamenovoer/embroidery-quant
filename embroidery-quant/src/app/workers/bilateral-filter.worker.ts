/// <reference lib="webworker" />

interface BilateralParams {
  sigmaSpace: number;
  sigmaColor: number;
  kernelSize: number;
  iterations: number;
}

interface WorkerImageData {
  data: number[];
  width: number;
  height: number;
}

interface WorkerMessage {
  imageData: WorkerImageData;
  params: BilateralParams;
}

addEventListener('message', ({ data }: MessageEvent<WorkerMessage>) => {
  const { imageData, params } = data;
  
  try {
    const inputData = new Uint8ClampedArray(imageData.data);
    const filteredData = bilateralFilter(inputData, imageData.width, imageData.height, params);
    
    postMessage({
      data: Array.from(filteredData),
      width: imageData.width,
      height: imageData.height
    });
  } catch (error) {
    postMessage({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

function bilateralFilter(
  data: Uint8ClampedArray, 
  width: number, 
  height: number, 
  params: BilateralParams
): Uint8ClampedArray {
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

  return output;
}