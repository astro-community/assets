import { stat } from 'fs/promises'
import { getFileHash } from './getFileHash.js'

/** @type {GetCachedFileHash} */
export const getCachedFileHash = (path) => {
	/** @type {Cache} */
	const cache = cacheMap[path] = cacheMap[path] || {}

	return stat(path).then(
		stats => {
			if (cache.mtimeMs === stats.mtimeMs && cache.size === stats.size) {
				return cache.hash
			} else {
				cache.mtimeMs = stats.mtimeMs
				cache.size = stats.size

				return getFileHash(path).then(
					hash => {
						cache.hash = hash

						return hash
					}
				)
			}
		},
		() => null
	)
}

/** @type {CacheMap} */
const cacheMap = {}

/** @typedef {import('./getCachedFileHash.d').Cache} Cache */
/** @typedef {import('./getCachedFileHash.d').CacheMap} CacheMap */
/** @typedef {import('./getCachedFileHash.d').GetCachedFileHash} GetCachedFileHash */
