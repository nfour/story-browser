"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathsToModuleExports = exports.makeStoryMap = void 0;
const camel_case_1 = require("camel-case");
const fast_glob_1 = __importDefault(require("fast-glob"));
const path_1 = require("path");
async function makeStoryMap({ patterns, outputPath, rootPath, }) {
    const searchFrom = (0, path_1.resolve)(rootPath);
    const paths = (await (0, fast_glob_1.default)(patterns, {
        absolute: true,
        caseSensitiveMatch: false,
        ignore: ['**/node_modules/**'],
        cwd: searchFrom,
    })).map(toPosixPath);
    const outputFilePath = (0, path_1.resolve)(rootPath, outputPath);
    const outputDir = (0, path_1.dirname)(outputFilePath);
    const importPaths = paths.map((path) => (0, path_1.relative)(outputDir, path));
    return { paths, searchFrom, outputFilePath, importPaths };
}
exports.makeStoryMap = makeStoryMap;
function pathsToModuleExports(paths) {
    const names = new Set();
    const imports = paths.map((path, i) => {
        const parsed = (0, path_1.parse)(path);
        const name = (() => {
            const symbolName = (0, camel_case_1.camelCase)(parsed.name);
            if (!names.has(symbolName))
                return symbolName;
            return `${symbolName}_${i}`;
        })();
        names.add(name);
        const importPath = `./${(0, path_1.format)({
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
exports.pathsToModuleExports = pathsToModuleExports;
function toPosixPath(fpath) {
    return fpath.split(path_1.sep).join(path_1.posix.sep);
}
