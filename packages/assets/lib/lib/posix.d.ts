export interface GetPathInfo {
	(path: string): PathInfo
}

export interface PathInfo {
	path: string
	dir: string
	file: string
	base: string
	ext: string
	type: string
	params: {
		[k: string]: string
	}
}

export interface GetPath {
	(path: string): string
}

export interface GetDir {
	(path: string): string
}

export const getPathInfo: GetPathInfo
export const getPath: GetPath
export const getDir: GetDir
