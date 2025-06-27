# Project Understanding - EmbroideryQuant

## Project Overview

EmbroideryQuant is a web-based image quantization application specifically designed for creating embroidery patterns. The project aims to build upon the existing `reference/image-quant-minimal.html` by adding bilateral filtering capabilities and modernizing the architecture.

## Core Requirements

### Primary Functionality
- **Image Quantization**: Reduce image colors to specified count (embroidery-friendly)
- **Bilateral Filtering**: Edge-preserving noise reduction applied BEFORE quantization
- **Multi-stage Preview**: Show Original → Filtered → Quantized progression
- **Download Capability**: Export processed images to local storage
- **Cross-platform Support**: iOS, Android, Mac, Windows (default browsers + Chrome)

### Technical Specifications
- **Framework**: Latest Angular (20+) with TypeScript
- **Quantization Library**: RgbQuant.js (proven, stable)
- **Filtering**: Bilateral filter implementation (from reference/bilateral-filter)
- **Deployment**: GitHub Pages hosting
- **Performance**: Browser-based processing with progress indicators

## Reference Implementation Analysis

The `reference/image-quant-minimal.html` provides a working baseline with:

### Current Features
- Image upload with file validation
- Color count slider (2-256 colors)
- Multiple dithering algorithms (Floyd-Steinberg, Atkinson, Burkes, etc.)
- Three-panel display: Original → Quantized Only → Quantized + Dithered
- Custom RgbQuant.js implementation using median cut algorithm
- Download functionality

### Technical Implementation
- **Quantization**: Custom median cut algorithm implementation
- **Dithering**: Complete error diffusion kernel map with 9 algorithms
- **UI**: Tailwind CSS for styling, responsive design
- **Processing**: Synchronous with setTimeout for UI responsiveness

## Enhancement Requirements

### New Features to Add
1. **Bilateral Filtering Stage**
   - Pre-processing step before quantization
   - User-adjustable parameters (sigmaSpace, sigmaColor)
   - Real-time preview of filtered image
   - Side-by-side comparison: Original → Filtered → Quantized

2. **Modern Architecture**
   - Angular framework with TypeScript
   - Component-based architecture
   - Service-oriented design
   - Web Workers for performance

3. **Enhanced UI/UX**
   - Angular Material components
   - Progressive enhancement
   - Mobile-responsive design
   - Progress indicators with cancellation

## Technical Architecture Plan

### Core Services
- **ImageProcessingService**: Orchestrate the processing pipeline
- **QuantizationService**: RgbQuant.js integration
- **BilateralFilterService**: Edge-preserving filtering
- **CanvasService**: Canvas operations and format conversion

### Processing Pipeline
```
Image Upload → Canvas Rendering → Bilateral Filter → Color Quantization → Dithering → Display/Download
```

### Component Structure
- **FileUploadComponent**: Drag & drop with validation
- **ParameterControlsComponent**: Sliders and selectors
- **ImageComparisonComponent**: Multi-stage preview display
- **ProcessingIndicatorComponent**: Progress with cancellation

## Key Insights from Reference

### Strengths to Preserve
- Robust dithering algorithm implementation
- Effective median cut quantization
- Clean three-stage comparison UI
- Comprehensive color palette generation

### Areas for Enhancement
- Add bilateral filtering preprocessing
- Modernize with Angular framework
- Improve performance with Web Workers
- Enhanced mobile experience
- Better error handling and user feedback

## Implementation Strategy

### Phase 1: Core Migration
- Port existing quantization logic to Angular services
- Implement bilateral filter service
- Create basic component structure

### Phase 2: Enhanced Features
- Add real-time parameter adjustment
- Implement progress indicators
- Optimize performance with Web Workers

### Phase 3: Polish & Optimization
- Mobile responsiveness improvements
- Advanced error handling
- Performance optimization
- User experience enhancements

## Success Criteria

### Technical Metrics
- Processing time < 5 seconds for typical images
- Mobile compatibility across major platforms
- Progressive enhancement for different browser capabilities

### User Experience
- Intuitive three-stage workflow
- Real-time parameter feedback
- Reliable download functionality
- Clear progress indication

This understanding forms the foundation for developing the modern, Angular-based EmbroideryQuant application while preserving the proven quantization techniques from the reference implementation.