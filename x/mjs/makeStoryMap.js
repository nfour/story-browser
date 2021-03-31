import { camelCase } from 'camel-case';
import fastGlob from 'fast-glob';
import { resolve, parse as parsePath, format as formatPath, dirname, relative, join, } from 'path';
export async function makeStoryMap({ patterns, outputPath, rootPath, }) {
    const searchFrom = resolve(rootPath);
    const paths = await fastGlob(patterns, {
        absolute: true,
        caseSensitiveMatch: false,
        ignore: ['**/node_modules/**'],
        cwd: searchFrom,
    });
    const outputFilePath = resolve(rootPath, outputPath);
    const outputDir = dirname(outputFilePath);
    const importPaths = paths.map((path) => relative(outputDir, path));
    return { paths, searchFrom, outputFilePath, importPaths };
}
export function pathsToModuleExports(paths) {
    const names = new Set();
    const imports = paths.map((path, i) => {
        const parsed = parsePath(path);
        const name = (() => {
            const symbolName = camelCase(parsed.name);
            if (!names.has(symbolName))
                return symbolName;
            return `${symbolName}_${i}`;
        })();
        names.add(name);
        const importPath = join('./', formatPath({
            ...parsed,
            base: undefined,
            ext: undefined,
        }));
        return { name, originalPath: path, importPath };
    });
    const importsText = imports.map(({ name, importPath }) => `import * as ${name} from '${importPath}'\n`);
    const exportsText = `export {\n${imports.map(({ name }) => `  ${name},\n`)}}`;
    return `${importsText}\n${exportsText}`;
}
