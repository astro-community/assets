import * as os from 'os'
import * as squoosh from '@squoosh/lib'

export class Image {
	decoded!: squoosh.Image['decoded']
	encode!: squoosh.Image['encode']
	encodedWith!: squoosh.Image['encodedWith']
	preprocess!: squoosh.Image['preprocess']

	static pool: squoosh.ImagePool

	constructor(uint: Uint8Array) {
		Image.pool = Image.pool || new squoosh.ImagePool(os.cpus().length)

		const squooshImage = Image.pool.ingestImage(uint)

		Object.setPrototypeOf(Image.prototype, Object.getPrototypeOf(squooshImage))
	}

	get info() {
		return this.decoded.then(
			(info) => ({
				height: info.bitmap.height,
				width: info.bitmap.width,
				size: info.size,
			})
		)
	}

	async encodeWith(type: string, options?: Partial<squoosh.EncoderOptions>) {
		const normalizedType: keyof squoosh.Encoders = (
			type === 'jpe' || type === 'jpeg' || type === 'jpg' ? 'mozjpeg'
			: type === 'jxl' ? 'jxl'
			: type === 'png' ? 'oxipng'
			: type === 'webp' ? 'webp'
			: type === 'wp2' ? 'wp2'
			: 'webp'
		)

		await this.encode({
			[normalizedType]: Object(options)
		})

		const info = await this.encodedWith[normalizedType]

		return info
	}

	static from(uint: Uint8Array) {
		return new Image(uint)
	}

	static codecFromExtension(ext: string) {
		switch (ext) {
			case 'jpe':
			case 'jpeg':
			case 'jpg':
				return 'mozjpeg'
			case 'jxl':
				return 'jxl'
			case 'png':
				return 'oxipng'
			case 'webp':
				return 'webp'
			case 'wp2':
				return 'wp2'
		}

		return null
	}

	static supportedType(type: string) {
		switch (type) {
			case 'image/jpeg':
			case 'image/jxl':
			case 'image/png':
			case 'image/webp':
			case 'image/webp2':
				return true
		}

		return false
	}
}

let imagePool: squoosh.ImagePool

export const from = (uint: Uint8Array) => {
	imagePool = imagePool || new squoosh.ImagePool(os.cpus().length)

	const image = imagePool.ingestImage(uint)
	const extra = {
		async encodeWith(this: typeof image, type: string, options?: Partial<squoosh.EncoderOptions>) {
			type = (
				type === 'jpe' || type === 'jpeg' || type === 'jpg' ? 'mozjpeg'
				: type === 'jxl' ? 'jxl'
				: type === 'png' ? 'oxipng'
				: type === 'webp' ? 'webp'
				: type === 'wp2' ? 'wp2'
				: 'webp'
			)
	
			await this.encode({
				[type]: Object(options)
			})
	
			const info = await this.encodedWith[type]

			return info
		},
		async getInfo(this: typeof image) {
			const info = await this.decoded
			
			return {
				height: info.bitmap.height,
				width: info.bitmap.width,
				size: info.size,
			}
		}
	}

	return Object.defineProperties(image, Object.getOwnPropertyDescriptors(extra)) as typeof image & typeof extra
}
