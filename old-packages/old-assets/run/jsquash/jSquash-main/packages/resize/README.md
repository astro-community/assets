# @jsquash/resize

An easy experience for resizing images in the browser or V8 environment. Powered by WebAssembly ⚡️ and Rust.

ℹ️ You will need to have an already decoded ImageData object to resize. This can be accomplished by using other jSquash modules or using the Canvas API, if available.

Uses squoosh's [Resize module](https://github.com/GoogleChromeLabs/squoosh/blob/dev/src/features/processors/resize/worker/resize.ts).
Composed of:
- https://github.com/PistonDevelopers/resize
- https://github.com/CryZe/wasmboy-rs/tree/master/hqx

A [jSquash](https://github.com/jamsinclair/jSquash) package. Codecs and supporting code derived from the [Squoosh](https://github.com/GoogleChromeLabs/squoosh) app.

## Installation

```shell
npm install --save @jsquash/resize
# Or your favourite package manager alternative
```

## Usage

Note: You will need to either manually include the wasm files from the codec directory or use a bundler like WebPack or Rollup to include them in your app/server.

### resize(data: ImageData, options: ResizeOptions): Promise<ImageData>

Resizes an ImageData object to the 

#### data
Type: `ImageData`

#### options
Type: `Partial<ResizeOptions> & { width: number, height: number }`

The resize options for the output image. [See default values](./meta.ts).
- `width` (number) the width to resize the image to 
- `height` (number) the height to resize the image to
- `method?` (`'triangle'` | `'catrom'` | `'mitchell'` | `'lanczos3'` | `'hqx'`) the algorithm used to resize the image. Defaults to `lanczos3`.
- `fitMethod?` (`'stretch'` | `'contain'`) whether the image is stretched to fit the dimensions or cropped. Defaults to `stretch`.
- `premultiply?` (boolean) Defaults to `true`
- `linearRGB?` (boolean) Defaults to `true`


#### Example
```js
import { decode } from '@jsquash/jpeg';
import resize from '@jsquash/resize';

const imageBuffer = fetch('/images/example.jpg').then(res => res.arrayBuffer());
const originalImageData = await decode(imageBuffer);
const resizedImageData = await resize(originalImageData, { height: 300, width: 400 };
```
