import fastGlob from "fast-glob";
import { writeFileSync } from "fs";
import { relative, resolve } from "path";

export async function makeStoryMap({
  patterns,
  outputPath,
  rootPath,
}: {
  patterns: string[];
  outputPath: string;
  rootPath: string;
}) {
  const paths = await fastGlob(patterns, {
    absolute: false,
    caseSensitiveMatch: false,
    ignore: ["**/node_modules/**"],
  });

  const relativePaths = paths.map((p) => `./${relative(rootPath, p)}`);
  const outputFilePath = resolve(rootPath, outputPath);

  return {
    paths,
    relativePaths,
    outputFilePath,
  };
}

export function writeStoryMap(paths: string[], toPath: string) {
  writeFileSync(toPath, JSON.stringify(paths), "utf8");
}
