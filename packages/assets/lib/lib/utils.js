import * as process from 'process'
import * as posix from './posix.js'
import * as webapi from '@astropub/webapi'

export const __object_assign = Object.assign
export const __object_freeze = Object.freeze
export const __object_isPrototypeOf = Function.call.bind(Object.prototype.isPrototypeOf)

export const TypedArray = Object.getPrototypeOf(Int8Array)

/** @type {globalThis.fetch} */
const fetch = globalThis.fetch || webapi.fetch

/** @type {{ (data: any): Promise<ArrayLike<number>> }} */
export const toArrayLike = (data) => {
	if (data !== Object(data)) {
		return toArrayLike(
			fetch(
				new URL(
					posix.getPath(data),
					new URL(posix.getDir(process.env()), 'file:')
				)
			)
		)
	}

	if (typeof data.then === 'function') {
		return data.then(toArrayLike)
	}

	if (typeof data.arrayBuffer === 'function') {
		return toArrayLike(data.arrayBuffer())
	}

	if (data.length < 1) {
		return []
	}

	return data
}
