export interface GetFileHash {
    (path: string): Promise<string>
}

export const getFileHash: GetFileHash