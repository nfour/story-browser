export declare function makeStoryMap({ patterns, outputPath, rootPath, }: {
    patterns: string[];
    outputPath: string;
    rootPath: string;
}): Promise<{
    paths: string[];
    searchFrom: string;
    outputFilePath: string;
    importPaths: string[];
}>;
export declare function pathsToModuleExports(paths: string[]): string;
