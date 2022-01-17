import { createHash } from 'crypto'
import { createReadStream } from 'fs'

/** @type {GetFileHash} */
export const getFileHash = (path) => new Promise((resolve, reject) => {
	const hash = createHash('sha1')

	hash.setEncoding('hex').on('finish', () => resolve(hash.read().slice(0, 8))).on('error', reject)

    createReadStream(path).pipe(hash)
})

/** @typedef {import('./getFileHash.d').GetFileHash} GetFileHash */
