import fastGlob from 'fast-glob';
import { dirname } from 'node:path';
import { relative, resolve } from 'path';
export async function makeStoryMap({ patterns, outputPath, rootPath, }) {
    const paths = await fastGlob(patterns, {
        absolute: false,
        caseSensitiveMatch: false,
        ignore: ['**/node_modules/**'],
    });
    const relativePaths = paths.map((p) => `./${relative(rootPath, p)}`);
    const outputFilePath = resolve(rootPath, outputPath);
    return { paths, relativePaths, outputFilePath };
}
export function pathsToModuleExports(paths) {
    const names = new Set();
    const imports = paths.map((path, i) => {
        const name = (() => {
            const baseName = `${dirname(path)}`;
            if (names.has(baseName)) {
                return `${baseName}_${i}`;
            }
            return baseName;
        })();
        names.add(name);
        return { name, path };
    });
    const importsText = imports.map(({ name, path }) => `import * as ${name} from '${path}';\n`);
    const exportsText = `export {\n${imports.map(({ name }) => `${name},\n`)}\n}`;
    return `${importsText}\n${exportsText}`;
}
