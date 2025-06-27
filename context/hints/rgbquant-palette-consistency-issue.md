# RgbQuant.js Palette Consistency Issue - Debugging Summary

## Date: June 27, 2025

## Problem Description

When building an image quantization app using RgbQuant.js to process both original and bilateral-filtered images, the quantized filtered image appeared completely black while the quantized original image looked correct. Both images were supposed to be processed "identically" by RgbQuant.js for proper comparison.

## Root Cause Analysis

### Initial Hypothesis (Incorrect)
Initially suspected that the bilateral filter was corrupting the ImageData format or introducing subtle differences in:
- Memory layout
- Data type 
- Image dimensions
- Alpha channel handling
- Buffer alignment

### Actual Root Cause (Correct)
The real issue was **separate palette generation**:

1. **Two separate RgbQuant instances** were being created:
   ```javascript
   this.quantizerOriginal = new RgbQuant(opts);
   this.quantizerFiltered = new RgbQuant(opts);
   ```

2. **Each instance built its own palette**:
   ```javascript
   this.quantizerOriginal.sample(originalImageData);  // Palette from original colors
   this.quantizerFiltered.sample(filteredImageData);  // Palette from filtered colors
   ```

3. **Different palettes led to different quantization results**: Since the bilateral filter smooths and changes colors, the filtered image had different color characteristics, resulting in a completely different color palette that was inappropriate for meaningful quantization.

## Solution Applied

### Changed from Separate Quantizers to Single Quantizer
```javascript
// BEFORE (broken):
this.quantizerOriginal = new RgbQuant(opts);
this.quantizerFiltered = new RgbQuant(opts);
this.quantizerOriginal.sample(originalImageData);
this.quantizerFiltered.sample(filteredImageData);

// AFTER (fixed):
this.quantizer = new RgbQuant(opts);
this.quantizer.sample(originalImageData);  // Build palette from original only
```

### Applied Same Palette to Both Images
```javascript
// Both images now use the same palette/quantizer instance
const quantizedOriginalData = this.quantizer.reduce(originalImageData);
const quantizedFilteredData = this.quantizer.reduce(filteredImageData);
```

## Key Learnings

### 1. RgbQuant.js Palette Building Process
- `sample()` method builds a color histogram from the input image
- `buildPal()` is called internally during first `reduce()` to create the final palette
- Once palette is built (`palLocked = true`), subsequent `reduce()` calls use the same palette
- Different input images → different histograms → different palettes

### 2. Importance of Consistent Palettes for Comparison
- When comparing processing effects (original vs filtered), both images must use the **same color palette**
- Using different palettes makes comparison meaningless as colors are mapped differently
- The palette should be derived from a reference image (typically the original)

### 3. RgbQuant.js API Design
- The library is designed to handle multiple images with the same palette by:
  1. Creating one instance
  2. Sampling from representative image(s) 
  3. Using same instance for all `reduce()` calls
- Creating separate instances defeats this design and leads to inconsistent results

### 4. Debugging Strategy Insights
- **Visual symptoms don't always indicate the root cause**: The black image suggested data corruption, but the real issue was palette mismatch
- **Trace the data flow**: Following how data moves through the pipeline revealed the separate palette issue
- **Understand library design**: Reading RgbQuant.js source code clarified the intended usage pattern

## Implementation Best Practices

### For Multi-Image Quantization
1. **Use single quantizer instance** for all related images
2. **Build palette from reference image** (usually the original/unprocessed one)
3. **Apply same palette to all variants** for meaningful comparison

### For Color Palette Consistency
1. Sample from the image with the most representative color distribution
2. Avoid sampling from heavily processed images (filtered, enhanced, etc.)
3. Consider sampling from multiple images if building a universal palette

### For Performance
1. Build palette once, reuse for multiple images
2. Use appropriate `initColors` setting (4096 default is usually good)
3. Consider `useCache` setting for repeated similar quantizations

## File Modified
- `/soft/workspace/code/EmbroideryQuant/tests/image-quantization-app.html`
- Changed from dual quantizer approach to single quantizer approach
- Result: Both original and filtered images now quantize correctly with the same palette

## Verification
- The fixed app now shows meaningful quantized results for both original and filtered images
- Users can properly compare how bilateral filtering affects the final quantized output
- Both images use identical color palettes derived from the original image
