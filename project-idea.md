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

### Input
- the user uploads an image
- the user can set the max number of colors to use
- if the underlying library provides image quality options, also let user adjusts those

### Output
- the quantized image, shown side-by-side with the input
- download option
- if the processing takes time, show progress bar and allow user to cancel by wish

## Algorithms Used
- image quantization
- image dithering given palette
- bilateral filtering

