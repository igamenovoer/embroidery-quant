# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EmbroideryQuant is a browser-based image quantization application for creating embroidery patterns. The app reduces image color palettes while preserving visual fidelity and edge details optimal for embroidery work.

**Technology Stack**: Angular 20+ with TypeScript, Angular Material UI, RgbQuant.js for quantization, custom bilateral filter, Web Workers, WebGPU/WebGL acceleration

## Development Commands

Since the main application files have been deleted from the current branch, the project appears to be in a restructuring phase. Based on the README.md, these are the expected development commands:

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Run tests
ng test

# Build for production
ng build --configuration production

# Deploy to GitHub Pages
ng deploy --base-href=/embroidery-quant/
```

## Architecture Overview

### Core Processing Pipeline
```
Image Upload → Canvas Rendering → Bilateral Filter → Quantization → Display Results
```

### Key Services (from documentation)
- **ImageProcessingService**: Main processing pipeline orchestration
- **CanvasService**: Canvas operations and image format conversion
- **BilateralFilterService**: Edge-preserving filter with Web Worker support
- **QuantizationService**: Color reduction using RgbQuant.js

### Key Components (from documentation)
- **FileUploadComponent**: Drag & drop file upload with validation
- **ImageProcessorComponent**: Main workflow interface
- **ParameterPanelComponent**: Interactive parameter controls
- **ImageComparisonComponent**: Side-by-side image display

## Technical Implementation Details

### Image Processing
- **Primary Library**: RgbQuant.js for color quantization
- **Filtering**: Custom bilateral filter implementation for edge preservation
- **Performance**: Web Workers for processing, WebGPU/WebGL acceleration with CPU fallback
- **Formats**: Supports PNG, JPEG, WebP input and output

### Embroidery-Specific Features
- Color count presets: 8, 16, 32 colors (common thread counts)
- Dithering algorithms: Floyd-Steinberg, Atkinson, Burkes
- Edge preservation through bilateral filtering
- Thread color matching with perceptual distance algorithms

### Browser Compatibility
- **Full Features**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- **Progressive Enhancement**: WebGPU → WebGL → Canvas → CPU fallback

## Context and Documentation

The `/context/` directory contains valuable development guidance:

- **`/context/hints/`**: Solutions to specific problems encountered during development
- **`/context/survey/`**: 
  - `cutting-edge-solution.md`: Advanced approach using WebGPU, neural networks
  - `production-ready-solution.md`: Stable implementation using proven libraries
- **`/context/tasks/`**: Development task guides and steps

### Reference Implementation
- **`/reference/RgbQuant.js/`**: Complete RgbQuant.js library with demos
- **`/reference/bilateral-filter/`**: Bilateral filter reference implementation

## Performance Targets

- **Page Load**: < 3 seconds
- **Image Processing**: < 5 seconds for typical images
- **Memory Usage**: < 200MB for standard workflow
- **Mobile Performance**: < 10 seconds on mid-range devices

## Development Notes

### Key Dependencies
- Angular 20+ with TypeScript
- Angular Material for UI components
- RgbQuant.js for color quantization
- Custom bilateral filter implementation

### Testing Strategy
- Unit tests for algorithm correctness
- Integration tests for end-to-end workflow
- Performance benchmarks across browsers
- Cross-browser compatibility testing

### Deployment
- **Platform**: GitHub Pages
- **Build**: Angular CLI with Webpack
- **Optimization**: Bundle size < 50KB (excluding UI framework)