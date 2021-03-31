"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathsToModuleExports = exports.makeStoryMap = void 0;
const fast_glob_1 = __importDefault(require("fast-glob"));
const node_path_1 = require("node:path");
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
        const name = (() => {
            const baseName = `${node_path_1.dirname(path)}`;
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
exports.pathsToModuleExports = pathsToModuleExports;
