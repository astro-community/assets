import { builtinModules } from 'module'
import { default as rollupTypeScript } from '@rollup/plugin-typescript'
import { promises as fs } from 'node:fs'
import { rollup } from 'rollup'

async function build() {
	const root = new URL('../', import.meta.url)

	const configs = [
		{
			inputOptions: {
				input: new URL('src/plugin.ts', root).pathname,
				plugins: [
					rollupTypeScript({
						tsconfig: new URL('../tsconfig.json', import.meta.url).pathname,
					}),
				],
				onwarn(warning, warn) {
					if (warning.code !== 'UNRESOLVED_IMPORT') warn(warning)
				},
				external: [
					...builtinModules,
					'@squoosh/lib',
					'web-streams-polyfill',
				],
			},
			outputOptions: {
				file: 'plugin.js',
				format: 'esm',
				sourcemap: true,
			},
		},
		{
			inputOptions: {
				input: new URL('src/image.ts', root).pathname,
				plugins: [
					rollupTypeScript({
						tsconfig: new URL('../tsconfig.json', import.meta.url).pathname,
					}),
				],
				onwarn(warning, warn) {
					if (warning.code !== 'UNRESOLVED_IMPORT') warn(warning)
				},
			},
			outputOptions: {
				file: 'image.js',
				format: 'esm',
				sourcemap: true,
			},
		},
	]

	for (const config of configs) {
		const bundle = await rollup(config.inputOptions)

		// or write the bundle to disk
		await bundle.write(config.outputOptions)

		// closes the bundle
		await bundle.close()

		// cleanup the bundle
		// await fs.cp(new URL('index.d.ts', root), new URL('mod.d.ts', root), { force: true, recursive: true })
		// await fs.rm(new URL('image.d.ts.map', root), { force: true, recursive: true })
		// await fs.rm(new URL('plugin.d.ts.map', root), { force: true, recursive: true })
		await fs.rm(new URL('lib', root), { force: true, recursive: true })
	}
}

build()
