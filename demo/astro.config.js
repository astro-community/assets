import { assetsPlugin } from '@astropub/assets'

// @ts-check
export default /** @type {import('astro').AstroUserConfig} */ ({
	// Comment out "renderers: []" to enable Astro's default component support.
	renderers: [],
	// buildOptions: {
	// 	site: 'http://localhost:3000/deeply/nested/subpath/'
	// },
	vite: {
		plugins: [
			assetsPlugin()
		]
	},
});
