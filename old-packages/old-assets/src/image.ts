interface ImageAsset {
	src: string
	type: string
	width: number
	height: number
	size: number
}

export class Image<T extends ImageAsset[] = ImageAsset[]> {
	sources!: T

	constructor(sources: T) {
		this.sources = sources
	}

	get src() {
		const source = this.sources.find(
			source => source.type === 'image/jpeg'
		) || this.sources.find(
			source => source.type === 'image/webp'
		) || this.sources.find(
			source => source.type === 'image/avif'
		)

		return source ? source.src : ''
	}

	get srcset() {
		let filtered: ImageAsset[] = []

		filtered = filtered.length ? filtered : this.sources.filter(
			source => source.type === 'image/jpeg'
		)
		
		filtered = filtered.length ? filtered : this.sources.filter(
			source => source.type === 'image/webp'
		)
		
		filtered = filtered.length ? filtered : this.sources.filter(
			source => source.type === 'image/avif'
		)

		return filtered.map(
			source => `${source.src} ${source.width}w`
		).join(',')
	}

	toString() {
		return this.src
	}
}
