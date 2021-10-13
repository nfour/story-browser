import { camelCase } from 'camel-case';
import fastGlob from 'fast-glob';
import { resolve, parse as parsePath, format as formatPath, dirname, relative, sep, posix, } from 'path';
export async function makeStoryMap({ patterns, outputPath, rootPath, }) {
    const searchFrom = resolve(rootPath);
    const paths = (await fastGlob(patterns, {
        absolute: true,
        caseSensitiveMatch: false,
        ignore: ['**/node_modules/**'],
        cwd: searchFrom,
    })).map(toPosixPath);
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
        const importPath = `./${formatPath({
            ...parsed,
            base: undefined,
            ext: undefined,
        })}`;
        return { name, originalPath: path, importPath };
    });
    return [
        imports
            .map(({ name, importPath }) => `import * as ${name} from '${importPath}'`)
            .join('\n'),
        '',
        'export {',
        imports.map(({ name }) => `  ${name},`).join('\n'),
        '}',
    ].join('\n');
}
function toPosixPath(fpath) {
    return fpath.split(sep).join(posix.sep);
}
