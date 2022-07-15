import {
  access,
  cp,
  lstat,
  mkdir,
  readFile,
  readdir,
  rename,
  writeFile
} from 'fs/promises'
import { basename, extname, join } from 'path'

import { Stats } from 'fs'
import pino from 'pino'

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
})

enum PathTypeCheck {
  DIRECTORY,
  FILE
}

type Dic<T> = { [key: string]: T }

/**
 * It returns a regular expression that matches a string with a key surrounded by curly braces.
 * @param {string} key - The key to be replaced in the template
 */
const regEx = (key: string): RegExp => new RegExp(`{{\s*[ ${key} ]+\s*}}`, 'g')

async function teaParse(
  template_path: string,
  destination_path: string,
  data: Dic<string>
): Promise<void> {
  try {
    await pathAccess(destination_path)
    const tpl_type_check = await pathTypeCheck(template_path)
    if (tpl_type_check.status === PathTypeCheck.DIRECTORY) {
      await copyTplDirToDestDir(template_path, destination_path)
      await readTemplatePath(destination_path, data, parseTemplatePath)
    }
  } catch (error) {
    logger.error(error)
  }
}

/**
 * It checks if a path is a file or a directory
 * @param {string} path - The path to the file or directory you want to check.
 * @returns A promise that resolves to an object with a status property and an optional error property.
 */
function pathTypeCheck(path: string): Promise<{ status: PathTypeCheck }> {
  return new Promise(async (resolve, reject) => {
    try {
      const path_check = await typeCheck(path)
      if (path_check.isDirectory()) {
        resolve({
          status: PathTypeCheck.DIRECTORY
        })
        return
      } else if (path_check.isFile()) {
        resolve({
          status: PathTypeCheck.FILE
        })
        return
      }
    } catch (error) {
      console.log(error)
      reject(logger.error(error))
    }
  })
}

/**
 * It checks if a path exists and if it does, it checks if it's accessible
 * @param {string} path - The path to the file or directory.
 */
async function pathAccess(path: string): Promise<void> {
  try {
    await access(path)
  } catch {
    makeNewDirectory(path)
  }
}

/**
 * It creates a new directory at the specified path
 * @param {string} path - The path to the directory you want to create.
 */
async function makeNewDirectory(path: string): Promise<void> {
  try {
    await mkdir(path)
  } catch (error) {
    logger.error(error)
  }
}

async function copyTplDirToDestDir(
  tpl_path: string,
  dest_path: string
): Promise<void> {
  try {
    await cp(tpl_path, dest_path, { recursive: true })
  } catch (error) {
    logger.error(error)
  }
}

async function parseTemplatePath(
  path: string,
  data: Dic<string>
): Promise<void> {
  try {
    if ((await typeCheck(path)).isDirectory()) {
      await readTemplatePath(path, data, parseTemplatePath)
    }
    if ((await typeCheck(path)).isFile()) {
      await parseTemplateFile(path, data)
    }
    await renameTemplateFile(path, data)
  } catch (error) {
    logger.error(error)
  }
}

/**
 * It takes a destination path, a file name, and a dictionary of regular expressions and file names,
 * and renames the file if the file name matches any of the regular expressions
 * @param {string} dest_path - The path to the directory where the files are located.
 * @param {string} file - The file name
 * @param data - Dic<string>
 */
async function renameTemplateFile(
  path: string,
  data: Dic<string>
): Promise<void> {
  try {
    const filename = basename(path)
    console.log(path, filename)
    Object.keys(data).forEach((key: string) => {
      regEx(key).test(filename) &&
        rename(
          path,
          join(
            path.split(filename).at(0) as string,
            `${data[key]}${extname(filename)}`
          )
        )
    })
  } catch (error) {
    logger.error(error)
  }
}

/**
 * It takes a file path and a dictionary of key-value pairs, and replaces all instances of the keys in
 * the file with their corresponding values
 * @param {string} path - The path to the file you want to parse.
 * @param data - Dic<string>
 */
async function parseTemplateFile(
  path: string,
  data: Dic<string>
): Promise<void> {
  const file = await readFile(path, 'utf-8')
  Object.keys(data).forEach((key: string) => {
    if (regEx(key).test(file)) {
      writeFile(path, file.replace(regEx(key), data[key]), 'utf-8')
    }
  })
}

/**
 * It reads a directory, and for each file in the directory, it calls a callback function
 * @param {string} path - The path to the template folder
 * @param data - Dic<string>
 * @param cb - (path: string, data: Dic<string>) => void
 */
async function readTemplatePath(
  path: string,
  data: Dic<string>,
  cb: (path: string, data: Dic<string>) => void
): Promise<void> {
  const files = await readdir(path)
  files.forEach((file) => cb(join(path, file), data))
}

/**
 * It takes a path and returns a promise that resolves to a Stats object
 * @param {string} path - The path to the file or directory.
 * @returns Promise<Stats>
 */
function typeCheck(path: string): Promise<Stats> {
  return lstat(path)
}
