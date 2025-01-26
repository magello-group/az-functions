#!/usr/bin/env node

import * as Codegen from '@sinclair/typebox-codegen'
import * as fs from 'fs/promises'
import * as path from 'path'
import prettier from 'prettier'
import { Command } from 'commander'

const program = new Command()

program
  .name('typebox-generator')
  .description('Tool to generate Typebox/JSON Schema from TypeScript files named *.models.ts')
  .version('1.0.0')
  .option('-j, --json', 'Generate JSON Schema. Default: typebox schema')
  .option('-r, --removetypes', 'Remove `export type` from the generated schema')
  .argument('<root>', 'Files to convert to schemas. Pattern *.models.ts')
  .action(async (root, options) => {
    try {
      const getModelFiles = async (dir: string, extension: string): Promise<string[]> => {
        let results: string[] = []
        const list = await fs.readdir(dir, { withFileTypes: true })
        for (const file of list) {
          const filePath = path.resolve(dir, file.name)
          if (file.isDirectory()) {
            results = results.concat(await getModelFiles(filePath, extension))
          } else if (file.isFile() && file.name.endsWith(extension)) {
            results.push(filePath)
          }
        }
        return results
      }
      const deleteFiles = await getModelFiles(root, '.schemas.ts')
      deleteFiles.forEach(async (filename: string) => {
        await fs.unlink(filename)
      })
      const filenames = await getModelFiles(root, '.models.ts')
      filenames.forEach(async (filename: string) => {
        const filePath = path.resolve(process.cwd(), filename)
        const raw = await fs.readFile(filePath, 'utf-8')
        let data = ''
        if (options.json) {
          data = Codegen.ModelToJsonSchema.Generate(
            Codegen.TypeScriptToModel.Generate(raw)
          )
        } else {
          data = Codegen.TypeScriptToTypeBox.Generate(raw, {
            useExportEverything: false,
          })
          data = data
            .split('\n')
            .map((line: string) => {
              if (options.removetypes) {
                if (line.includes(', Static, ')) {
                  return line.replace(', Static, ', ', ')
                }
                return line.includes('export type') ? '' : line
              }
              return line
            })
            .join('\n')
        }
        const outputFile = path.join(
          path.join(path.dirname(filePath)),
          `${path.basename(filename, path.extname(filename)).replace('.models', '.schemas')}.ts`
        )
        const output = await prettier.format(data, {
          parser: 'typescript',
          semi: false,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5',
          printWidth: 80,
        })
        await fs.writeFile(outputFile, `// generated file, do not edit\n\n${output}`, 'utf-8')

        const relativeOutputFile = path.relative(root, outputFile)
        console.log(`Schema written to ${relativeOutputFile}`)
      })
    } catch (error) {
      console.error('Error:', error)
    }
  })

program
  .command('help')
  .description('Display help information')
  .action(() => {
    program.outputHelp()
  })

program.parse(process.argv)
