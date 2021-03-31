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
    const paths = await fast_glob_1.default(patterns, {
        absolute: false,
        caseSensitiveMatch: false,
        ignore: ['**/node_modules/**'],
    });
    const relativePaths = paths.map((p) => `./${path_1.relative(rootPath, p)}`);
    const outputFilePath = path_1.resolve(rootPath, outputPath);
    return { paths, relativePaths, outputFilePath };
}
exports.makeStoryMap = makeStoryMap;
function pathsToModuleExports(paths) {
    const names = new Set();
    const imports = paths.map((path, i) => {
        const parsed = path_1.parse(path);
        const name = (() => {
            const symbolName = camel_case_1.camelCase(parsed.name);
            if (!names.has(symbolName))
                return symbolName;
            return `${symbolName}_${i}`;
        })();
        names.add(name);
        const pathWithoutExt = path_1.format({
            ...parsed,
            base: undefined,
            ext: undefined,
        });
        return { name, originalPath: path, pathWithoutExt };
    });
    const importsText = imports.map(({ name, pathWithoutExt }) => `import * as ${name} from '${pathWithoutExt}'\n`);
    const exportsText = `export {\n${imports.map(({ name }) => `  ${name},\n`)}}`;
    return `${importsText}\n${exportsText}`;
}
exports.pathsToModuleExports = pathsToModuleExports;
