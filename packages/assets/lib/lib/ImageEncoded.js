import { ImageDecoded } from './ImageDecoded.js'
import * as codecs from '@astropub/codecs'
import * as utils from './utils.js'

/** @type {WeakMap<ImageEncoded, { image: codecs.Image }>} */
const _ = new WeakMap()

export class ImageEncoded {
	/** @arg {Uint8Array} data */
	constructor(data, width = 0, height = 0) {
		const type = codecs.getType(source)

		if (type === '') throw new TypeError('Could not read image source.')

		/** @type {codecs.ExtensionType} */
		const ext = codecs.getExtension(source)

		/** @type {{ width: number, height: number }} */
		const rect = Object(codecs.getMeasurements(source))

		width = width || rect.width || width
		height = height || rect.height || height

		utils.__object_freeze(
			utils.__object_assign(
				this,
				{
					type,
					ext,
					data,
					width,
					height,
				}
			)
		)
	}

	/** @this {{ ext: codecs.ExtensionType }} @returns {Promise<ImageData>} */
	decoded() {
		return codecs[this.ext].decode(this).then(
			image => new ImageDecoded(image.data, image.width, image.height)
		)
	}

	static from(data) {
		return utils.toArrayLike(data).then(
			uint => new this(uint)
		)
	}
}
