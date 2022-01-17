# @jsquash/png

An easy experience for encoding and decoding PNG images in the browser. Powered by WebAssembly ⚡️.

Uses the [rust PNG crate](https://docs.rs/png/0.11.0/png/).

A [jSquash](https://github.com/jamsinclair/jSquash) package. Codecs and supporting code derived from the [Squoosh](https://github.com/GoogleChromeLabs/squoosh) app.

## Installation

```shell
npm install --save @jsquash/png
# Or your favourite package manager alternative
```

## Usage

Note: You will need to either manually include the wasm files from the codec directory or use a bundler like WebPack or Rollup to include them in your app/server.

### decode(data: ArrayBuffer): Promise<ImageData>

Decodes PNG binary ArrayBuffer to raw RGB image data.

#### data
Type: `ArrayBuffer`

#### Example
```js
import { decode } from '@jsquash/png';

const formEl = document.querySelector('form');
const formData = new FormData(formEl);
const imageData = await decode(await formData.get('image').arrayBuffer());
```

### encode(data: ImageData): Promise<ArrayBuffer>

Encodes raw RGB image data to PNG format and resolves to an ArrayBuffer of binary data.

#### data
Type: `ImageData`

#### Example
```js
import { encode } from '@jsquash/png';

async function loadImage(src) {
  const img = document.createElement('img');
  img.src = src;
  await new Promise(resolve => img.onload = resolve);
  const canvas = document.createElement('canvas');
  [canvas.width, canvas.height] = [img.width, img.height];
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}

const rawImageData = await loadImage('/example.jpg');
const pngBuffer = await encode(rawImageData);
```