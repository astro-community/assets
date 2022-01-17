import { Results } from './lib/getCachedEncodedImage.d'
export { Result, Results } from './lib/getCachedEncodedImage.d'

export type Name = '@astropub/assert'

export interface GetImageCode {
	(data: Results, state: PluginConfig): string
}

export interface Plugin {
	name: Name
	enforce: 'pre'
	load(sourceId: string): Promise<void>
}

export interface PluginFactory {
	(options?: Partial<PluginOptions>): Plugin
}

export interface PluginOptions {
	quality: number
	sizes: number[]
	types: ImageFormats[]
}

export interface PluginConfig {
	cacheDir: string
	cacheDirReady: Promise<void>
	quality: number
	sizes: number[]
	types: ImageFormats[]
	paths: {
		[path: string]: Promise<{
			data: Uint8Array
			mime: string
			width: number
			height: number
		}>
	}
}

export type ImageFormats = 'avif' | 'jpg' | 'png' | 'webp' | 'wp2'
