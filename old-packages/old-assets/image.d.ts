interface ImageAsset {
    src: string;
    type: string;
    width: number;
    height: number;
    size: number;
}
export declare class Image<T extends ImageAsset[] = ImageAsset[]> {
    sources: T;
    constructor(sources: T);
    get src(): string;
    get srcset(): string;
    toString(): string;
}
export {};
