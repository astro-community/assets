import { ExtensionType, ImageType } from '@astropub/codecs'
import { ImageDecoded } from './ImageDecoded.d'

export declare class ImageEncoded {
	constructor(data: Uint8Array)

	decoded(): Promise<ImageDecoded>

	static from(data: any): Promise<ImageEncoded>

	type: ImageType
	ext: ExtensionType
	data: Uint8Array
	width: number
	height: number
}
