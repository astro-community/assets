import * as webapi from '@astropub/webapi'
import * as fs from 'node:fs/promises'
import * as js from './lib/js-exportify.js'
import AdmZip from 'adm-zip'

webapi.polyfill(globalThis)

URL.prototype.goto = {
	goto(href) {
		return new URL(href, this)
	}
}.goto

const cwd = new URL('./', import.meta.url)

fs.stat(cwd.goto('jsquash/')).then(
	(dirStat) => dirStat.isDirectory()
		? undefined
		: fs.stat(cwd.goto('jsquash.zip')).then(
			(zipStat) => zipStat.isFile()
				? undefined
			: fetch(new URL('https://github.com/jamsinclair/jSquash/archive/refs/heads/main.zip')).then(
				(response) => response.arrayBuffer()
			).then(
				(buffer) => new Uint8Array(buffer)
			).then(
				(binary) => fs.writeFile(cwd.goto('jsquash.zip'), binary)
			)
		).then(
			() => new AdmZip(cwd.goto('jsquash.zip').pathname).extractAllTo(jSquashDirPath.pathname, true)
		)
).then(
	() => Promise.all(
		[
			['jpeg/codec/dec', 'mozjpeg_dec', 'decode', (uint, ...args) => {
				if (!calledRun) {
					createWasm()
					run()
				}

				return Module.ready.then(() => {
					const decoded = Module.decode(uint, ...args)

					return {
						binary: new Uint8Array(decoded.data),
						width: decoded.width,
						height: decoded.height,
					}
				})
			}],
			['webp/codec/dec', 'webp_dec', 'decode', (uint, ...args) => {
				if (!calledRun) {
					createWasm()
					run()
				}

				return Module.ready.then(() => {
					const decoded = Module.decode(uint, ...args)

					return {
						binary: new Uint8Array(decoded.data),
						width: decoded.width,
						height: decoded.height,
					}
				})
			}],
			['jpeg/codec/enc', 'mozjpeg_enc', 'encode', (uint, width, height, options) => {
				if (!calledRun) {
					createWasm()
					run()
				}

				return Module.ready.then(() => {
					options = Object.assign({
						quality: 75,
						baseline: false,
						arithmetic: false,
						progressive: true,
						optimize_coding: true,
						smoothing: 0,
						color_space: 3,
						quant_table: 3,
						trellis_multipass: false,
						trellis_opt_zero: false,
						trellis_opt_table: false,
						trellis_loops: 1,
						auto_subsample: true,
						chroma_subsample: 2,
						separate_chroma_quality: false,
						chroma_quality: 75,
					}, options)

					const encoded = Module.encode(uint, width, height, options)

					return {
						binary: new Uint8Array(encoded),
						width,
						height,
						options
					}
				})
			}],
			['webp/codec/enc', 'webp_enc', 'encode', (uint, width, height, options) => {
				if (!calledRun) {
					createWasm()
					run()
				}

				return Module.ready.then(() => {
					options = Object.assign({
						quality: 75,
						target_size: 0,
						target_PSNR: 0,
						method: 4,
						sns_strength: 50,
						filter_strength: 60,
						filter_sharpness: 0,
						filter_type: 1,
						partitions: 0,
						segments: 4,
						pass: 1,
						show_compressed: 0,
						preprocessing: 0,
						autofilter: 0,
						partition_limit: 0,
						alpha_compression: 1,
						alpha_filtering: 1,
						alpha_quality: 100,
						lossless: 0,
						exact: 0,
						image_hint: 0,
						emulate_jpeg_size: 0,
						thread_level: 0,
						low_memory: 0,
						near_lossless: 100,
						use_delta_palette: 0,
						use_sharp_yuv: 0,
					}, options)

					const encoded = Module.encode(uint, width, height, options)

					return {
						binary: new Uint8Array(encoded),
						width,
						height,
						options
					}
				})
			}],
		].map(
			([ dir, base, key, fun ]) => 
			fs.readFile(
				cwd.goto(`jsquash/jSquash-main/packages/${dir}/${base}.wasm`),
				'base64'
			).then(
				wasm => fetch(cwd.goto(`jsquash/jSquash-main/packages/${dir}/${base}.js`)).then(
					(response) => response.text()
				).then(
					(code) => {
						code = code.slice(122 + 50, -55 - 3 - 6)
		
						code = js.exportify(code, wasm, key, Function.prototype.toString.call(fun))
	
						fs.writeFile(cwd.goto(`../src/lib/${base}.js`), code)
					}
				)
			)
		)
	)
)
