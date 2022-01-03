declare module '@squoosh/lib' {
	interface EncoderOptions {
		quality: number
	}

	interface EncoderOptionsForAvif extends EncoderOptions {
		cqLevel: number
		cqAlphaLevel: number
		denoiseLevel: number
		tileColsLog2: number
		tileRowsLog2: number
		speed: number
		subsample: number
		chromaDeltaQ: boolean
		sharpness: number
		tune: number
	}

	interface EncoderOptionsForJxl extends EncoderOptions {
		speed: number
		progressive: boolean
		epf: number
		nearLossless: number
		lossyPalette: boolean
		decodingSpeedTier: number
	}

	interface EncoderOptionsForMozjpeg extends EncoderOptions {
		baseline: boolean
		arithmetic: boolean
		progressive: boolean
		optimize_coding: boolean
		smoothing: number
		color_space: number
		quant_table: number
		trellis_multipass: boolean
		trellis_opt_zero: boolean
		trellis_opt_table: boolean
		trellis_loops: number
		auto_subsample: boolean
		chroma_subsample: number
		separate_chroma_quality: boolean
		chroma_quality: number
	}

	interface EncoderOptionsMap {
		avif: EncoderOptionsForAvif
		jxl: EncoderOptionsForJxl
		mozjpeg: EncoderOptionsForMozjpeg
		oxipng: EncoderOptions
		webp: EncoderOptions
		wp2: EncoderOptions
		svg: EncoderOptions
	}

	type ImageEncodeOptions = {
		[EncoderType in string]:
			EncoderType extends keyof EncoderOptionsMap
				? Partial<EncoderOptionsMap[EncoderType]>
			: Partial<EncoderOptions>
	}

	interface ImagePreprocessOptions {
		quant?: Partial<QuantOptions>
		resize?: Partial<ResizeOptions>
		rotate?: Partial<RotateOptions>
	}

	interface ResizeOptions {
		width: number
		height: number
		method: 'triangle' | 'catrom' | 'mitchell' | 'lanczos3'
		premultiply: boolean
		linearRGB: boolean
	}

	interface QuantOptions {
		numColors: number
		dither: number
	}

	interface RotateOptions {
		numRotations: number
	}

	interface EncoderResults<TOps extends EncoderOptions = EncoderOptions, TExt extends string = string> {
		binary: Uint8Array
		extension: TExt
		optionsUsed: TOps
		size: number
	}

	interface EncoderResultsMap {
		avif: EncoderResults<EncoderOptionsMap['avif'], 'avif'>
		jxl: EncoderResults<EncoderOptionsMap['jxl'], 'jxl'>
		mozjpeg: EncoderResults<EncoderOptionsMap['mozjpeg'], 'jpg'>
		oxipng: EncoderResults<EncoderOptionsMap['oxipng'], 'png'>
		webp: EncoderResults<EncoderOptionsMap['webp'], 'webp'>
		wp2: EncoderResults<EncoderOptionsMap['wp2'], 'wp2'>
	}

	type EncoderKey = 'mozjpeg' | 'webp' | 'avif' | 'jxl' | 'wp2' | 'oxipng'

	type EncodeParams = {
		bitmap: any
		encConfig: any
		encName: EncoderKey
		maxOptimizerRounds: number
		operation: 'encode'
		optimizerButteraugliTarget: number
	}

	type DecodeParams = {
		file: ArrayBuffer | ArrayLike<number>
		operation: 'decode'
	}

	type PreprocessParams = {
		operation: 'preprocess'
		preprocessorName: 'resize' | 'quant' | 'rotate'
		options: any
		image: { bitmap: ImageData }
	}

	type JobMessage = EncodeParams | DecodeParams | PreprocessParams

	type ImageFile = ArrayBuffer | ArrayLike<number>

	interface Encoder {
		name: string
		extension: EncoderKey
		detectors: RegExp
		defaultEncoderOptions: EncoderOptions
		autoOptimize: Record<string, any>

		dec(): any
		enc(): any
	}

	interface Encoders {
		avif: Encoder
		jxl: Encoder
		mozjpeg: Encoder
		oxipng: Encoder
		webp: Encoder
		wp2: Encoder
		svg: Encoder
	}

	var encoders: Encoders

	interface Preprocessor {
		name: string
		description: string
		defaultOptions: EncoderOptions

		instantiate(): unknown
	}

	interface Preprocessors {
		quant: Preprocessor
		resize: Preprocessor
		rotate: Preprocessor
	}

	var preprocessors: Preprocessors

	class Image<TFile extends ImageFile = ImageFile, TWorkerPool extends WorkerPool = WorkerPool> {
		decoded: Promise<ImageInformation>
		encodedWith: {
			[T in string]: T extends keyof EncoderOptionsMap ? Promise<EncoderResults<EncoderOptionsMap[T], T>> : Promise<EncoderResults<EncoderOptions, T>>
		}
		file: TFile
		workerPool: TWorkerPool

		encode(encodeOptions: ImageEncodeOptions): Promise<void>
		preprocess(preprocessOptions: ImagePreprocessOptions): Promise<void>
	}

	interface ImageInformation {
		bitmap: ImageData
		size: number
	}

	class ImagePool<TMessage extends string = string, TThreads extends number = number> {
		constructor(threads: TThreads)

		workerPool: WorkerPool<TMessage, TThreads>

		close(): Promise<void>
		ingestImage<TFile extends ImageFile>(file: TFile): Image<TFile, this['workerPool']>
	}

	class WorkerPool<TMessage extends string = string, TThreads extends number = number> {
		constructor(numWorkers: TThreads, workerFile: string)

		done: Promise<void>
		jobQueue: TransformStream<Job<TMessage>, Job<TMessage>>
		numWorkers: TThreads
		workerQueue: TransformStream<Worker, Worker>

		dispatchJob(msg: TMessage): Promise<any>
	}

	interface Job<TMessage extends string = string> {
		msg: TMessage

		reject: Function
		resolve: Function
	}
}
