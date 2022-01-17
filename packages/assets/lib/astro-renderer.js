import { vitePlugin } from './vite-plugin.js'

export const name = '@astropub/assets'

export const astroRenderer = {
	name,
	server: './server.js',
	viteConfig() {
		return {
			plugins: [
				vitePlugin(),
			],
		}
	},
}
