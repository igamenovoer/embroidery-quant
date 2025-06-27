# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EmbroideryQuant is a browser-based image quantization application designed for creating embroidery patterns. The app reduces image color palettes while preserving visual fidelity and edge details optimal for embroidery work.

## Project Structure

This is currently a planning and research repository with the following structure:

- `project-idea.md` - Core project requirements and specifications
- `design/development-plan.md` - Comprehensive technical architecture and implementation roadmap
- `survey/` - Technology research and evaluation
  - `cutting-edge-solution.md` - Advanced WebGPU/neural network approach
  - `production-ready-solution.md` - Stable library-based implementation
- `reference/bilateral-filter/` - Example bilateral filter implementation

## Technology Stack (Planned)

### Frontend Framework
- **Angular 20+** (latest version) with TypeScript
- **Angular CLI v20.0.4** (pre-installed) for project scaffolding and build
- **Angular Material** for UI components
- **Node.js v22.17.0 LTS** with npm v10.9.2

### Core Libraries
- **RgbQuant.js** - Primary image quantization engine with built-in dithering
- **Bilateral Filter** - Custom JavaScript implementation for edge-preserving preprocessing
- **WebGPU/WebGL** - GPU acceleration with progressive fallback

### Development Tools
- **nvm 0.39.3** for Node.js version management
- **Angular CLI** for build, test, and development server
- **GitHub Pages** for deployment with automated CI/CD

## Common Development Commands

Since this project is in the planning phase, no package.json or build system exists yet. When implementation begins:

```bash
# Project initialization (when ready to implement)
ng new embroidery-quant --routing --style=scss
cd embroidery-quant

# Development server
ng serve

# Build for production
ng build --configuration production

# Run tests
ng test

# Run linting
ng lint

# Deploy to GitHub Pages
ng deploy --base-href=/EmbroideryQuant/
```

## Architecture Concepts

### Processing Pipeline
```
Image Upload → Canvas Rendering → Bilateral Filter (with preview) → RgbQuant Processing → Display Results
```

### Three-Stage UI Design
1. **Original Image**: Uploaded image display
2. **Filtered Image**: Bilateral filter preview with real-time parameter adjustment
3. **Quantized Result**: Final processed image with color reduction

### Performance Strategy
- Progressive enhancement: WebGPU → WebGL → Canvas fallback
- Web Workers for large image processing
- Real-time bilateral filter preview with parameter adjustment
- Memory optimization for mobile devices

## Key Implementation Guidelines

### Image Processing
- Use RgbQuant.js for quantization with embroidery-specific presets (8, 16, 32 colors)
- Implement bilateral filtering with configurable sigma parameters
- Support multiple dithering algorithms (Floyd-Steinberg, Atkinson, etc.)
- Provide real-time preview for bilateral filter adjustments

### Browser Compatibility
- Primary targets: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- Feature detection for WebGPU/WebGL capabilities
- Graceful fallbacks for older browsers

### User Experience
- Drag & drop file upload with validation
- Side-by-side image comparison
- Progress tracking with cancellation option
- Download options for processed images

## Development Phases

1. **Core Infrastructure** - Angular project setup, file upload, canvas rendering
2. **Image Processing Pipeline** - RgbQuant.js integration, bilateral filter implementation
3. **User Experience Enhancement** - UI polish, progress tracking, download functionality
4. **Performance Optimization** - Web Workers, GPU acceleration, memory management

## Current Status

This repository contains planning and research documentation. The actual Angular application has not been created yet. When beginning implementation, start with Phase 1 of the development plan and use the production-ready solution approach for stability.