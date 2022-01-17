import { ImageEncoded } from './ImageEncoded.js'
import * as utils from './utils.js'

export class ImageDecoded {
	/** @arg {Uint8ClampedArray} data, @arg {number} width, @arg {number} height */
	constructor(data, width, height) {
		utils.__object_freeze(
			utils.__object_assign(
				this,
				{
					data,
					width,
					height,
				}
			)
		)
	}

	/** @this {typeof ImageDecoded} @arg {any} data, @arg {number} [width], @arg {number} [height] */
	static from(data, width = 0, height = 0) {
		if (utils.__object_isPrototypeOf(Uint8ClampedArray, Object(data).data)) {
			return new this(data.data, width || data.width, height || data.height)
		}

		return utils.toArrayLike(data.data, data).then(
			uint => {
				const encoded = new ImageEncoded(uint)

				return new this(encoded.data, width || encoded.width, height || encoded.height)
			}
		)
	}
}
