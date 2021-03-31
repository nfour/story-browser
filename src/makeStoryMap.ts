import { camelCase } from 'camel-case'
import fastGlob from 'fast-glob'
import {
  relative,
  resolve,
  parse as parsePath,
  format as formatPath,
} from 'path'

export async function makeStoryMap({
  patterns,
  outputPath,
  rootPath,
}: {
  patterns: string[]
  outputPath: string
  rootPath: string
}) {
  const paths = await fastGlob(patterns, {
    absolute: false,
    caseSensitiveMatch: false,
    ignore: ['**/node_modules/**'],
  })

  const relativePaths = paths.map((p) => `./${relative(rootPath, p)}`)
  const outputFilePath = resolve(rootPath, outputPath)

  return { paths, relativePaths, outputFilePath }
}

export function pathsToModuleExports(paths: string[]) {
  const names = new Set<string>()

  const imports = paths.map((path, i) => {
    const parsed = parsePath(path)
    const name = (() => {
      const symbolName = camelCase(parsed.name)

      if (!names.has(symbolName)) return symbolName

      return `${symbolName}_${i}`
    })()

    names.add(name)

    const pathWithoutExt = formatPath({
      ...parsed,
      base: undefined,
      ext: undefined,
    })

    return { name, originalPath: path, pathWithoutExt }
  })

  const importsText = imports.map(
    ({ name, pathWithoutExt }) =>
      `import * as ${name} from '${pathWithoutExt}'\n`,
  )

  const exportsText = `export {\n${imports.map(({ name }) => `  ${name},\n`)}}`

  return `${importsText}\n${exportsText}`
}
