# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EmbroideryQuant is a browser-based image quantization application for creating embroidery patterns. The app reduces image color palettes while preserving visual fidelity and edge details optimal for embroidery work.

**Technology Stack**: Angular 20+ with TypeScript, Angular Material UI, RgbQuant.js for quantization, custom bilateral filter, Web Workers, WebGPU/WebGL acceleration

## Project Structure

The project is currently in a documentation and planning phase. The main application has not been implemented yet, but the directory is organized as follows:

```
/EmbroideryQuant/
├── CLAUDE.md                    # This guidance file
├── README.md                    # Project overview and documentation
├── context/                     # Development context and documentation
│   ├── api-docs/               # API documentation
│   ├── design/                 # Design documents and project planning
│   │   └── project-idea.md     # Core project requirements
│   ├── hints/                  # Development hints and problem solutions
│   ├── memory/                 # AI assistant memory and understanding
│   │   └── project-understanding.md  # Project comprehension notes
│   ├── survey/                 # Technology surveys and solution approaches
│   │   ├── cutting-edge-solution.md    # Advanced tech approach
│   │   └── production-ready-solution.md # Stable tech approach
│   └── tasks/                  # Development task guides
├── reference/                  # Reference implementations and libraries
│   ├── RgbQuant.js/           # RgbQuant.js library with demos
│   ├── bilateral-filter/       # Bilateral filter reference
│   ├── image-quant-minimal.html    # Minimal quantization demo
│   └── image-quant-with-filter.html # Enhanced demo with filtering
└── tests/                      # Empty test directory
```

## Development Commands

The Angular application has been created in `/embroidery-quant/`. Standard Angular CLI commands:

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

The `/context/` directory contains comprehensive development guidance:

- **`/context/design/project-idea.md`**: Core project requirements and specifications
- **`/context/memory/project-understanding.md`**: AI assistant's understanding of the project
- **`/context/hints/`**: Solutions to specific problems encountered during development
- **`/context/survey/`**: 
  - `cutting-edge-solution.md`: Advanced approach using WebGPU, neural networks
  - `production-ready-solution.md`: Stable implementation using proven libraries
- **`/context/tasks/`**: Development task guides and steps
- **`/context/api-docs/`**: API documentation for libraries

### Reference Implementation
- **`/reference/RgbQuant.js/`**: Complete RgbQuant.js library with demos and examples
- **`/reference/bilateral-filter/`**: Bilateral filter reference implementation
- **`/reference/image-quant-minimal.html`**: Working minimal quantization demo
- **`/reference/image-quant-with-filter.html`**: Enhanced demo with filtering capabilities
- **`/reference/angular/`**: Full Angular source code for documentation, examples, and API guides

## Current Project State

The project has **basic Angular application structure** implemented in `/embroidery-quant/`:
- ✅ Angular 20+ with TypeScript and Material Design
- ✅ Component architecture: ImageUpload, ParameterControl, ImageResults  
- ✅ Service layer defined: ImageProcessing, BilateralFilter, Quantization, Canvas
- ✅ Basic UI layout with Material Design components
- ✅ Successfully builds and ready for feature implementation

## Angular Development Resources

- **`/reference/angular/`**: Complete Angular framework source code
  - Use this for finding documentation, examples, and API guides
  - Contains full Angular codebase for reference when implementing features
  - Helpful for understanding Angular patterns, best practices, and advanced usage

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