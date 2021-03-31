export declare function makeStoryMap({ patterns, outputPath, rootPath, }: {
    patterns: string[];
    outputPath: string;
    rootPath: string;
}): Promise<{
    paths: string[];
    relativePaths: string[];
    outputFilePath: string;
}>;
export declare function writeStoryMap(paths: string[], toPath: string): void;
