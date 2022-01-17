/** @type {import('./posix.d').GetPathInfo} */
export const getPathInfo = (rawpath) => {
	const [ path, search ] = getPath(rawpath).split(/(?<=^[^?]+)\?/)

	const dir  = path.replace(/[^/]+\/?$/, '')
	const file = path.slice(dir.length)
	const base = file.replace(/\.[^.]+$/, '')
	const ext  = file.slice(base.length + 1)
	const params = Object.fromEntries(new URLSearchParams(search))

	return { path, dir, file, base, ext, params }
}

/** @type {import('./posix.d').GetPath} */
export const getPath = (path) => String(
	path == null ? '' : path
).replace(
	// convert slashes
	/\\+/g, '/'
).replace(
	// prefix a slash to drive letters
	/^(?=[A-Za-z]:\/)/, '/'
).replace(
	// encode path characters
	/%/g, '%25'
).replace(
	/\n/g, '%0A'
).replace(
	/\r/g, '%0D'
).replace(
	/\t/g, '%09'
)

/** @type {import('./posix.d').GetDir} */
export const getDir = (path) => getPath(path).replace(/\/?$/, '/')
