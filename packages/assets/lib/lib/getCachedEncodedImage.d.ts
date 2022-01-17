import { ImageType } from '@astropub/codecs'
import { PluginConfig } from '../vite-plugin'
import { PathInfo } from './posix'

export interface GetCachedEncodedImage {
	(pathInfo: PathInfo, state: PluginConfig): Promise<Result>
}

export interface Results {
	hash: string
	type: {
		avif: Result
		jpg: Result
		png: Result
		webp: Result
		wp2: Result
	}
}

export interface Result {
	path: string
	mime: ImageType,
	width: number,
	height: number,
	wait: Promise<Uint8Array>
}

export const getCachedEncodedImage: GetCachedEncodedImage
