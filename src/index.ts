import {
  access,
  cp,
  mkdir,
  readFile,
  readdir,
  rename,
  writeFile
} from 'fs/promises'
import { extname, join } from 'path'

import { lstatSync } from 'fs'
import pino from 'pino'

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
})

type dataDic = { [key: string]: string }

/**
 * It returns a regular expression that matches a string with a key surrounded by curly braces.
 * @param {string} key - The key to be replaced in the template
 */
const regEx = (key: string): RegExp => new RegExp(`{{\s*[ ${key} ]+\s*}}`, 'g')

/**
 * It takes a template directory, a destination directory, and a data object, and then it parses the
 * template directory and creates the destination directory
 * @param {string} template_directory - The directory where the template files are located.
 * @param {string} destination_directory - The directory where the project will be created.
 * @param {dataDic} data - dataDic
 */
function tparse(
  template_directory: string,
  destination_directory: string,
  data: dataDic
) {
  access(destination_directory)
    .then(() => parseDir(template_directory, destination_directory, data))
    .catch(async () => {
      logger.warn(`Destination path doesn't exist`)
      logger.info(`Create directory ${destination_directory}.`)
      await makeDir(destination_directory)
      await parseDir(template_directory, destination_directory, data)
    })
    .finally(() =>
      logger.info(`Project has been created at ${destination_directory}`)
    )
}

/**
 * It creates a directory
 * @param {string} dest_dir - The directory where the file will be saved.
 * @returns A promise that resolves to void
 */
function makeDir(dest_dir: string): Promise<void> {
  return mkdir(dest_dir)
}

/**
 * It reads the files in the template directory, copies them to the destination directory, parses the
 * file contents, and parses the file name
 * @param {string} tpl_dir - the directory where the template files are located
 * @param {string} dest_dir - the destination directory
 * @param {dataDic} data - the data object that will be used to replace the template variables
 */
async function parseDir(
  tpl_dir: string,
  dest_dir: string,
  data: dataDic
): Promise<void> {
  const files = await readdir(tpl_dir)
  await copyTplToDest(tpl_dir, dest_dir)
  files.forEach(async (file: string) => {
    await parseFile(join(dest_dir, file), data)
    await parseFileName(dest_dir, file, data)
  })
}

/**
 * It copies a file from a template directory to a destination directory
 * @param {string} tpl_dir - The directory where the template files are located.
 * @param {string} dest_dir - The directory where the file will be copied to.
 * @param {string} file - The file to copy
 * @returns A promise that resolves to void
 */
function copyTplToDest(
  tpl_dir: string,
  dest_dir: string
): Promise<void> | undefined {
  if (isDirectory(tpl_dir)) {
    return cp(tpl_dir, dest_dir, { recursive: true })
      .then(() => logger.info('All file have been copied!'))
      .catch((err) => logger.error(err.message))
  }
  return
}

/**
 * `parseFileName` takes a destination directory, a file name, and a dictionary of variables, and
 * renames the file if the file name contains a key from the dictionary
 * @param {string} dest_dir - The directory where the files are located.
 * @param {string} file - the file name
 * @param {dataDic} vars - dataDic
 */
async function parseFileName(dest_dir: string, file: string, vars: dataDic) {
  if (isDirectory(join(dest_dir, file))) {
    const sub_dir = join(dest_dir, file)
    const files = await readdir(sub_dir)
    files.forEach((file: string) => parseFileName(sub_dir, file, vars))
  }
  Object.keys(vars).forEach(
    (key: string) =>
      regEx(key).test(file) &&
      rename(
        join(dest_dir, file),
        join(dest_dir, `${vars[key]}${extname(file)}`)
      )
  )
}

/**
 * It reads a file, then replaces the variables in the file with the values in the dataDic.
 * @param {string} file_path - The path to the file you want to parse.
 * @param {dataDic} vars - dataDic
 */
function parseFile(file_path: string, vars: dataDic) {
  if (isFile(file_path)) {
    readTplFile(file_path)
      .then((tpl: string) => {
        Object.keys(vars).forEach((key: string) => {
          if (regEx(key).test(tpl)) {
            tpl = tpl.replace(regEx(key), vars[key])
            writeFile(file_path, tpl.replace(regEx(key), vars[key]), 'utf-8')
          }
        })
      })
      .catch((err) => logger.error(err.message))
  }
}

/**
 * It reads a file and returns a promise that resolves to the file's contents
 * @param {string} file_path - The path to the file to read.
 * @returns A promise that resolves to a string.
 */
function readTplFile(file_path: string): Promise<string> {
  return readFile(file_path, 'utf-8')
}

function isDirectory(path: string): boolean {
  return lstatSync(path).isDirectory()
}

function isFile(path: string): boolean {
  return lstatSync(path).isFile()
}

export default tparse
