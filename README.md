# Astro Image Plugin Idea

The image plugin will let you import images, convert them into other formats and sizes, and use them with a built-in image component.

## Usage

```astro
---
import Kitten from './assets/kitten.jpg?type=avif,webp&size=320,640,960&as=astro'
---
<Kitten alt="Good Kitty" />
```

```html
<picture>
  <source type="image/avif" srcset="
    path/to/assets/kitten-320.avif 320w,
    path/to/assets/kitten-640.avif 640w,
    path/to/assets/kitten-960.avif 960w
  " />
  <source type="image/webp" srcset="
    path/to/assets/kitten-320.webp 320w,
    path/to/assets/kitten-640.webp 640w,
    path/to/assets/kitten-960.webp 960w
  " />
  <img
    alt="Good Kitty"
    style="aspect-ratio:32/18;inline-size:100%"
  />
</picture>
```



### API Usage

```astro
---
import kittenImagesByType from './assets/kitten.jpg?type=avif,webp&size=320,640,960'

console.log(kittenImagesByType)
/* {
  avif: [
    {
      src: 'path/to/assets/kitten-320.avif',
      srcset: 'path/to/assets/kitten-320.avif 320w',
      type: 'image/avif',
      width: 320,
      height: 180,
      size: 3656,
    },
    {
      src: 'path/to/assets/kitten-640.avif',
      srcset: 'path/to/assets/kitten-640.avif 640w',
      type: 'image/avif',
      width: 640,
      height: 320,
      size: 10082,
    },
    {
      src: 'path/to/assets/kitten-960.avif',
      srcset: 'path/to/assets/kitten-960.avif 960w',
      type: 'image/avif',
      width: 960,
      height: 540,
      size: 19924,
    },
  ],
  webp: [
    {
      src: 'path/to/assets/kitten-320.webp',
      srcset: 'path/to/assets/kitten-320.webp 320w',
      type: 'image/webp',
      width: 320,
      height: 180,
      size: 5688,
    },
    {
      src: 'path/to/assets/kitten-640.webp',
      srcset: 'path/to/assets/kitten-640.webp 640w',
      type: 'image/webp',
      width: 640,
      height: 320,
      size: 17204,
    },
    {
      src: 'path/to/assets/kitten-960.webp',
      srcset: 'path/to/assets/kitten-960.webp 960w',
      type: 'image/webp',
      width: 960,
      height: 540,
      size: 35490,
    },
  ],
} */
---
```
