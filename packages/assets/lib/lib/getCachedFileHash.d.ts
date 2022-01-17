export interface GetCachedFileHash {
	(path: string): Promise<string | null>
}

export interface CacheMap {
	[path: string]: Cache
}

export interface Cache {
	mtimeMs: number
	size: number
	hash: string
}

export const getCachedFileHash: GetCachedFileHash
