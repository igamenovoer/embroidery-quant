# EmbroideryQuant

A browser-based image quantization application designed for creating embroidery patterns. The app reduces image color palettes while preserving visual fidelity and edge details optimal for embroidery work.

## 🎯 Features

- **Image Upload**: Drag & drop or file picker with validation
- **Bilateral Filtering**: Edge-preserving preprocessing with real-time preview
- **Color Quantization**: RgbQuant.js integration with embroidery-specific optimization
- **Multiple Dithering**: Floyd-Steinberg, Atkinson, Burkes, and more algorithms
- **Three-Stage UI**: Original → Filtered → Quantized image comparison
- **Download Options**: Export processed images in PNG, JPEG, or WebP
- **GPU Acceleration**: WebGPU/WebGL support with fallback to CPU processing
- **Mobile Responsive**: Works on desktop and mobile devices

## 🚀 Technology Stack

- **Frontend**: Angular 20+ with TypeScript
- **UI Framework**: Angular Material
- **Image Processing**: RgbQuant.js for quantization, custom bilateral filter
- **Performance**: Web Workers, WebGPU/WebGL acceleration
- **Build**: Angular CLI with Webpack
- **Deployment**: GitHub Pages

## 📦 Installation

### Prerequisites
- Node.js v22.17.0 LTS
- npm v10.9.2
- Angular CLI v20.0.4

### Setup
```bash
# Clone the repository
git clone https://github.com/igamenovoer/embroidery-quant.git
cd embroidery-quant

# Install dependencies
npm install

# Start development server
ng serve

# Build for production
ng build --configuration production
```

## 🎨 Usage

1. **Upload Image**: Drag & drop or select an image file (JPEG, PNG, WebP)
2. **Adjust Bilateral Filter**: Fine-tune edge preservation with real-time preview
3. **Configure Quantization**: Set color count (2-64) and dithering options
4. **Process**: Apply filters and quantization
5. **Download**: Export your embroidery-ready pattern

## 🏗️ Architecture

### Core Services
- **ImageProcessingService**: Main processing pipeline orchestration
- **CanvasService**: Canvas operations and image format conversion
- **BilateralFilterService**: Edge-preserving filter with Web Worker support
- **QuantizationService**: Color reduction using RgbQuant.js

### Components
- **FileUploadComponent**: Drag & drop file upload with validation
- **ImageProcessorComponent**: Main workflow interface
- **ParameterPanelComponent**: Interactive parameter controls
- **ImageComparisonComponent**: Side-by-side image display

### Processing Pipeline
```
Image Upload → Canvas Rendering → Bilateral Filter → Quantization → Display Results
```

## 🔧 Development

### Project Structure
```
src/
├── app/
│   ├── components/          # UI components
│   ├── services/           # Business logic services
│   ├── models/             # Data models and interfaces
│   ├── workers/            # Web Workers for performance
│   └── types/              # TypeScript declarations
├── design/                 # Documentation and planning
└── assets/                 # Static resources
```

### Key Commands
```bash
# Development server
ng serve

# Run tests
ng test

# Build for production
ng build --prod

# Deploy to GitHub Pages
ng deploy --base-href=/embroidery-quant/
```

## 🎯 Embroidery Optimization

The app includes specific optimizations for embroidery patterns:

- **Color Count Presets**: 8, 16, 32 colors (common thread counts)
- **Edge Preservation**: Bilateral filtering maintains important details
- **Dithering Control**: Subtle dithering suitable for fabric reproduction
- **Thread Color Matching**: Perceptual color distance algorithms
- **Pattern Complexity Analysis**: Stitch count and difficulty estimation

## 🌐 Browser Support

### Full Features
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

### Fallback Support
- Older browsers with Canvas API support
- Progressive enhancement for WebGPU/WebGL features

## 📄 Documentation

- [Development Plan](design/development-plan.md) - Comprehensive technical roadmap
- [Class Design](design/class-design.md) - Technical architecture and API documentation
- [CLAUDE.md](CLAUDE.md) - AI assistant guidance for the codebase

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

## 📊 Performance Targets

- **Page Load**: < 3 seconds
- **Image Processing**: < 5 seconds for typical images
- **Memory Usage**: < 200MB for standard workflow
- **Mobile Performance**: < 10 seconds on mid-range devices

## 🔮 Roadmap

### Phase 1: Core Implementation (Current)
- ✅ Project setup and architecture
- ✅ Core services implementation
- 🚧 UI components and integration
- ⏳ End-to-end workflow testing

### Phase 2: Enhanced Features
- Real-time parameter adjustment
- Custom color palette import/export
- Batch processing capabilities
- Advanced dithering algorithms

### Phase 3: Advanced Optimization
- WebGPU compute shaders
- Neural network quantization
- Thread database integration
- Pattern complexity analysis

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- GitHub Issues: [Report bugs or request features](https://github.com/igamenovoer/embroidery-quant/issues)
- Documentation: Check the `/design` folder for detailed technical documentation
- Community: Discussions and questions welcome in GitHub Discussions

---

**EmbroideryQuant** - Transform your images into beautiful embroidery patterns with precision and ease.