# Image quantization for embroidery pattern

## Introduction
This project develops an web-based image quantization app, which quantizes an image with given number of colors, and aims to:
- preserve visual fidelity
- the output should be easily used as embroidery pattern
- the whole thing runs in browser, can make use of GPU (via webGL or webGPU) and web-assembly, assuming the user is using the latest Chrome browser in PC
- can make use of deep learning model running inside browser
- consider ios/android compatibility if not hurting the features, otherwise just make it for PC.
- provides a download option, to allow the processed image to be downloaded to local disk
- the whole app will be hosted in github pages
- prefer to use the cutting-edge latest algorithms

### Input
- the user uploads an image
- the user can set the max number of colors to use
- if the underlying library provides image quality options, also let user adjusts those
- allow the user the filter the image using bilateral filtering
- - allow the user to adjust the parameters
- - allow the user to see the filtered image before quantization

### Output
- the quantized image, shown side-by-side with the input
- download option
- if the processing takes time, show progress bar and allow user to cancel by wish

## Algorithms Used
- image quantization
- - lib: [RgbQuant.js](https://github.com/leeoniya/RgbQuant.js/)
- - the [official example](https://leeoniya.github.io/RgbQuant.js/demo/)
- image dithering given palette
- - prefer to use RgbQuant.js builtin feature
- - let the user change algorithm arguments
- bilateral filtering
- - example in reference/bilateral-filter

## Libraries
- prefer to use libraries in survey/production-ready-solution.md
- use latest Angular framework
