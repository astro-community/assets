import { ExtensionType, ImageType } from '@astropub/codecs'
// import { ImageEncoded } from './ImageEncoded.d'

export declare class ImageDecoded {
	constructor(data: Uint8Array)

	static from(data: any): Promise<ImageDecoded>

	type: ImageType
	ext: ExtensionType
	data: Uint8Array
	width: number
	height: number
}
