import { astroRenderer } from './lib/astro-renderer.js'
import { vitePlugin } from './lib/vite-plugin.js'

export const name = '@astropub/assets'

export { vitePlugin as assetsPlugin }

export default astroRenderer
