import * as codecs from '@astropub/codecs'
import * as fs from 'fs/promises'
import { getCachedFileHash } from './getCachedFileHash.js'

/** @type {import('./getCachedEncodedImage.d').GetCachedEncodedImage} */
export const getCachedEncodedImage = async (pathInfo, config) => {
	const hash = await getCachedFileHash(pathInfo.path)
	const file = await fs.readFile(pathInfo.path)
	const type = codecs.getExtension(file)

	if (type === '') return null

	const image = await codecs[type].decode(file)

	/** @type {import('./getCachedEncodedImage.d').Results} */
	const result = { hash, type: {} }

	for (const type of config.types) {
		const codec = codecs[type]

		result.type[type] = {}

		for (const width of config.sizes) {
			const height = Math.round(width / image.width * image.height)
			const compiledFile = `${pathInfo.base}@${width}w.${hash}.${type}`
			const compiledPath = `${config.cacheDir}${compiledFile}`

			result.type[type][width] = {
				path: `/@assets/${compiledFile}`,
				mime: mimeByType[type],
				width,
				height,
				wait: fs.readFile(compiledPath).then(
					// use a cached image
					(buffer) => new Uint8Array(buffer),
					// use a new cached image
					() => codecs.resize(image, { width: width }).then(
						resizedImage => codec.encode(resizedImage, {
							quality: config.quality
						}).then(
							encodedImage => fs.writeFile(compiledPath, encodedImage).then(
								() => encodedImage,
							)
						)
					)
				)
			}
		}
	}

	const compiledFile = `${pathInfo.base}@blur.${hash}.webp`
	const compiledPath = `${config.cacheDir}${compiledFile}`

	result.blur = {
		path: `/@assets/${compiledFile}`,
		mime: 'image/webp',
		width: 32,
		height: Math.round(32 / image.width * image.height),
		data: await fs.readFile(compiledPath, 'base64').catch(
			// use a new cached image
			() => codecs.blurhash.encode(image, {
				quality: 75
			}).then(
				blurredImage => codecs.blurhash.decode(blurredImage, { width: 32 })
			).then(
				blurredImage => codecs.webp.encode(blurredImage)
			).then(
				blurredImage => fs.writeFile(compiledPath, blurredImage).then(
					() => Buffer.from(blurredImage).toString('base64')
				)
			)
		).then(
			base64 => `data:image/web;base64,${base64}`
		)
	}



	return result
}

/** @type {Record<codecs.ExtensionType, string>} */
const mimeByType = {
	avif: 'image/avif',
	jpg: 'image/jpeg',
	jxl: 'image/jxl',
	png: 'image/png',
	webp: 'image/webp',
	wp2: 'image/webp2',
}
