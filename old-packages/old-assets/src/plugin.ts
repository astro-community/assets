import * as crypto from 'crypto'
import * as fs from 'fs/promises'
import * as posix from './lib/posix'
import * as squoosh from './lib/squoosh'
import * as codecs from './lib/codecs'
import * as vite from 'vite'

interface ImageDataInternals<T1 extends Uint8ClampedArray = Uint8ClampedArray, T2 extends number = number, T3 extends number = number> {
	data: T1
	width: T2
	height: T3
}

const _ = new WeakMap<ImageData, ImageDataInternals>()

function ImageData<T1 extends Uint8ClampedArray, T2 extends number, T3 extends number>(this: ImageData, data: T1, width: T2, height: T3) {
	_.set(this, { data, width, height })
}

Object.defineProperties(ImageData.prototype, Object.getOwnPropertyDescriptors({
	get data(): ImageDataInternals['data'] {
		const internal = _.get(this as ImageData)

		if (internal === undefined) throw new TypeError('The ImageData.data getter can only be used on instances of ImageData')

		return internal.data
	},

	get width(): ImageDataInternals['width'] {
		const internal = _.get(this as ImageData)

		if (internal === undefined) throw new TypeError('The ImageData.width getter can only be used on instances of ImageData')

		return internal.width
	},

	get height(): ImageDataInternals['height'] {
		const internal = _.get(this as ImageData)

		if (internal === undefined) throw new TypeError('The ImageData.height getter can only be used on instances of ImageData')

		return internal.height
	},
}))

Reflect.set(globalThis, 'ImageDataPF', ImageData)

interface Internals {
	codecs: Record<string, any>
	assetsDir: string
	modulesDir: string
	rootDir: string

	images: WeakMap<Uint8Array, squoosh.Image>
}

interface ImageAsset {
	src: string
	type: string
	width: number
	height: number
	size: number
}

const getNormalizedExtension = (ext: string) => (
	ext === 'jpe' || ext === 'jpeg' || ext === 'jpg' ? 'jpg'
	: ext === 'jxl' ? 'jxl'
	: ext === 'png' ? 'png'
	: ext === 'webp' ? 'webp'
	: ext === 'wp2' ? 'wp2'
	: null
)

const getOptions = (pathURL: posix.PathURL) => {
	const quality = Math.min(Math.max(Math.round(Number(pathURL.params.quality) || 0), 100), 0)

	const sizes = [
		...new Set(
			String(pathURL.params.size || 0).split(',').map(
				size => Math.round(Number(size))
			).filter(
				size => size >= 0
			)
		)
	]

	const types = [
		...new Set(
			String(pathURL.params.type || pathURL.ext).split(',').map(
				ext => getNormalizedExtension(ext)
			).filter(
				codec => codec !== null
			)
		)
	] as Exclude<ReturnType<typeof getNormalizedExtension>, null>[]

	return { quality, sizes, types }
}

const getEmittedImageFileName = (pathURL: posix.PathURL, type: Exclude<ReturnType<typeof getNormalizedExtension>, null>, size: number, quality: number) => {
	const json = JSON.stringify({ href: pathURL.path, type: type, size, quality })
	const hash = crypto.createHash('sha256').update(json).digest('hex').slice(0, 8)

	const file = `${pathURL.base}.${hash}.${type}`

	return file
}

const getContentType = (ext: string) => (
	ext === 'jpe' || ext === 'jpeg' || ext === 'jpg' ? 'image/jpeg'
	: ext === 'jxl' ? 'image/jxl'
	: ext === 'png' ? 'image/png'
	: ext === 'webp' ? 'image/webp'
	: ext === 'wp2' ? 'image/webp2'
	: 'image/webp'
)

const getDetectedType = (uint: Uint8Array) => {
	if ([0xff, 0xd8, 0xff].every((b, i) => uint[i] === b)) {
		return 'image/jpeg'
	}
	if (
		[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
			(b, i) => uint[i] === b
		)
	) {
		return 'image/png'
	}
	if ([0x47, 0x49, 0x46, 0x38].every((b, i) => uint[i] === b)) {
		return 'image/gif'
	}
	if (
		[0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50].every(
			(b, i) => !b || uint[i] === b
		)
	) {
		return 'image/webp'
	}
	if ([0x3c, 0x3f, 0x78, 0x6d, 0x6c].every((b, i) => uint[i] === b)) {
		return 'image/svg+xml'
	}
	if (
		[0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66].every(
			(b, i) => !b || uint[i] === b
		)
	) {
		return 'image/avif'
	}
	if (
		[[74, 104], [84, 116], [84, 116], [80, 112]].every(
			([b1, b2], i) => uint[i] === b1 || uint[i] === b2
		)
	) {
		return 'text/uri-list'
	}
	return null
}

export const assets = () => {
	const internal = {
		assetsDir: 'assets',
		codecs: {},
		modulesDir: posix.toPath(new URL('..', import.meta.url).pathname),
		rootDir: '.',
	} as Internals

	const plugin: vite.Plugin = {
		name: '@astropub/assets',
		enforce: 'pre',
		configResolved(config) {
			internal.assetsDir = posix.toPath(config.build.assetsDir)
			internal.modulesDir = posix.toPath(posix.toPath(config.root) + '/node_modules')
			internal.rootDir = posix.toPath(config.root)
		},
		async load(id) {
			const pathURL = posix.from(id)

			const ext = getNormalizedExtension(pathURL.ext)

			if (ext === null) return undefined

			const opts = getOptions(pathURL)

			const exports = [] as ImageAsset[]

			let sourceUint: Uint8Array | null = null

			for (const size of opts.sizes) {
				let sourceImage: ReturnType<typeof squoosh.from> | null = null

				for (const type of opts.types) {
					const emittedFile = getEmittedImageFileName(pathURL, type, size, opts.quality)

					try {
						const uint = await fs.readFile(new URL(emittedFile, 'file:')).then(buffer => new Uint8Array(buffer.buffer))

						// const image = squoosh.from(uint)

						// const info = await image.getInfo()

						// exports.push({
						// 	src: `/${internal.assetsDir}/${emittedFile}`,
						// 	type: getContentType(type),
						// 	size: info.size,
						// 	width: info.width,
						// 	height: info.height,
						// })
					} catch (_error) {
						sourceUint = await fs.readFile(pathURL.path).then(buffer => new Uint8Array(buffer.buffer), _error => null)

						if (sourceUint === null) return undefined

						if (sourceImage === null) {
							// sourceImage = squoosh.from(sourceUint)

							// if (size) await sourceImage.preprocess({
							// 	resize: {
							// 		width: size,
							// 	},
							// })
						}

						// const { width: originalW, height: originalH } = await sourceImage.getInfo()

						const result1 = await codecs.decodeJPEG(sourceUint)

						const result2 = await codecs.encodeWEBP(
							result1.binary,
							result1.width,
							result1.height
						)

						console.log({ result2 })

						// const info = await sourceImage.encodeWith(type, opts.quality ? { quality: opts.quality } : {})

						// const cacheDirURL = new URL(`${internal.modulesDir}/.cache/`, 'file:')

						// await fs.mkdir(cacheDirURL, { recursive: true })

						// const cacheImgURL = new URL(emittedFile, cacheDirURL)

						// await fs.writeFile(cacheImgURL, info.binary)

						// exports.push({
						// 	src: `/${internal.assetsDir}/${emittedFile}`,
						// 	type: getContentType(type),
						// 	size: info.size,
						// 	width: size,
						// 	height: Math.round(originalH / (size / originalW)),
						// })
					}
				}
			}

			return [
				`import { Image } from '@astropub/assets/image'`,
				`export default new Image(${JSON.stringify(exports)})`
			].join('\n')
		},
		configureServer(server) {
			server.middlewares.use(async (req, response, next) => {
				const pathURL = posix.from(req.url)

				const assetsUrlStart = `/${internal.assetsDir}/`

				if (!pathURL.path.startsWith(assetsUrlStart)) return next()

				const imageURL = new URL(`${internal.modulesDir}/.cache/${pathURL.path.slice(assetsUrlStart.length)}`, 'file:')

				try {
					const fd = await fs.open(imageURL, 'r')

					response.setHeader('Content-Type', getContentType(pathURL.ext))
					response.setHeader('Cache-Control', 'max-age=360000')

					return fd.createReadStream().pipe(response)
				} catch (error) {
					next()
				}
			})
		},
		async generateBundle(_options, bundle) {
			// for (const [assetURL, asset] of internal.assets) {
			// 	const emittedHash = this.emitFile({
			// 		type: 'asset',
			// 		name: `${internal.assetsDir}/${asset.asFile}`,
			// 		source: asset.asUint,
			// 	})

			// 	const emittedPath = this.getFileName(emittedHash)

			// 	for (const [_fileName, bundledAsset] of Object.entries(bundle)) {
			// 		if (bundledAsset.type === 'asset' && typeof bundledAsset.source === 'string') {

			// 			bundledAsset.source = bundledAsset.source.replace(
			// 				// replace any asset urls with emitted urls
			// 				regex.toRegExp(assetURL),
			// 				emittedPath
			// 			).replace(
			// 				regex.toRegExp(asset.asVite),
			// 				() => posix.relative(
			// 					// replace any vite constants with emitted urls
			// 					internal.rootDir + posix.toPath(bundledAsset.fileName),
			// 					internal.rootDir + posix.toPath(emittedPath)
			// 				)
			// 			)
			// 		}
			// 	}
			// }
		}
	}

	return plugin
}
