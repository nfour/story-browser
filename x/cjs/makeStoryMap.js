"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeStoryMap = exports.makeStoryMap = void 0;
const fast_glob_1 = __importDefault(require("fast-glob"));
const fs_1 = require("fs");
const path_1 = require("path");
async function makeStoryMap({ patterns, outputPath, rootPath, }) {
    const paths = await fast_glob_1.default(patterns, {
        absolute: false,
        caseSensitiveMatch: false,
        ignore: ["**/node_modules/**"],
    });
    const relativePaths = paths.map((p) => `./${path_1.relative(rootPath, p)}`);
    const outputFilePath = path_1.resolve(rootPath, outputPath);
    return {
        paths,
        relativePaths,
        outputFilePath,
    };
}
exports.makeStoryMap = makeStoryMap;
function writeStoryMap(paths, toPath) {
    fs_1.writeFileSync(toPath, JSON.stringify(paths), "utf8");
}
exports.writeStoryMap = writeStoryMap;
