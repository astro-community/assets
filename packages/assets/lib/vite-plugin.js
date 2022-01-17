import { Duplex } from 'stream'
import { defaultPluginOptions } from './lib/defaultPluginOptions.js'
import { getCachedEncodedImage } from './lib/getCachedEncodedImage.js'
import { getPathInfo } from './lib/posix.js'
import * as fs from 'fs/promises'

export const name = '@astropub/assert'

/** @type {import('./vite-plugin.d').PluginFactory} */
export const vitePlugin = (options) => {
	options = Object.assign({}, defaultPluginOptions, options)

	void options

	/** @type {import('./vite-plugin.d').PluginConfig} */
	const config = {
		cacheDir: null,
		cacheDirReady: null,
		quality: Number(options.quality) || 70,
		sizes: options.sizes.slice(0).sort((a, b) => a - b),
		types: options.types,
		paths: {},
	}

	/** @type {import('./vite-plugin.d').Plugin} */
	const plugin = {
		name,
		enforce: 'pre',
		configResolved(resolvedConfig) {
			config.cacheDir = resolvedConfig.cacheDir.replace(/[^\/]+\/?$/, '.cache/')

			config.cacheDirReady = fs.mkdir(config.cacheDir, { recursive: true })
		},
		async load(rawSourceId) {
			const pathInfo = getPathInfo(rawSourceId)

			// skip unsupported image
			if (
				pathInfo.ext !== 'avif' &&
				pathInfo.ext !== 'jpg' &&
				pathInfo.ext !== 'png' &&
				pathInfo.ext !== 'webp' &&
				pathInfo.ext !== 'wp2'
			) return

			const data = await getCachedEncodedImage(pathInfo, config)

			for (const type in data.type) {
				for (const size in data.type[type]) {
					/** @type {import('./vite-plugin.d').Result} */
					const { path, mime, width, height, wait } = data.type[type][size]

					config.paths[path] = wait.then(
						data => ({
							data,
							mime,
							width,
							height,
						})
					)
				}
			}

			config.blur = data.blur

			return {
				code: getImageCode(data, config)
			}
		},
		configureServer(server) {
			server.middlewares.use(async (req, response, next) => {
				const pathInfo = getPathInfo(req.url)

				if (!(pathInfo.path in config.paths)) {
					return next()
				}

				const image = await config.paths[pathInfo.path]
				const stream = new Duplex()

				stream.push(image.data)
				stream.push(null)

				response.setHeader('Content-Type', image.mime);
				response.setHeader('Cache-Control', 'max-age=360000');

				return stream.pipe(response)
			})
		}
	}

	return plugin
}

/** @type {import('./vite-plugin.d').GetImageCode} */
const getImageCode = (data, config) => {
	const literalType = config.types.at(-1)
	const defaultType = data.type[literalType]
	const literalSize = Number(config.sizes.at(-1))
	const defaultSize = defaultType[literalSize]
	const defaultPath = JSON.stringify(config.blur.data)

	const imageObject = {
		toString: `function(){return${defaultPath}}`,
		src: defaultPath,
		srcset: `"${Object.entries(defaultType).map(
			([ size, data ]) => `${data.path} ${size}w`
		)}"`,
		width: defaultSize.width,
		height: defaultSize.height,
	}

	for (const type of config.types) {
		const currentType = data.type[type]
		const currentSize = currentType[config.sizes.at(-1)]
		const currentPath = JSON.stringify(currentSize.path)

		imageObject[type] = {
			toString: `function(){return${currentPath}}`,
			src: currentPath,
			srcset: `"${Object.entries(currentType).map(
				([ size, data]) => `${data.path} ${size}w`
			)}"`
		}
	}

	return `export default ${getJS(imageObject)}`
}

const getJS = (value) => {
	if (value !== Object(value)) return String(value)

	let props = []

	for (const name in value) props.push(`${name}:${getJS(value[name])}`)

	return `{${props.join(',')}}`
}
