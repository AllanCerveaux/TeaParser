import { basename, extname, join } from 'path'
import { readFile, readdir, rename, writeFile } from 'fs/promises'

import { Dic } from './types'
import Path from './Path'

/**
 * It takes a path to a directory and a dictionary of key-value pairs, then it replaces the keys in the
 * directory with the values
 * @param {string} path - The path to the template directory.
 * @returns A function that returns an object.
 */
export function Template(path: string) {
  return {
    data: {},

    pattern(key: string): RegExp {
      return new RegExp(`{{\s*[ ${key} ]+\s*}}`, 'g')
    },

    async parse(data: Dic<string>): Promise<void> {
      this.data = data
      const files = (await this.read(path)) as string[]
      files.forEach(async (tpl_file: string) => {
        const tpl_file_path = join(path, tpl_file)
        if (await Path(tpl_file_path).isDirectory()) {
          Template(tpl_file_path).parse(data)
        } else if (await Path(tpl_file_path).isFile()) {
          this.write(tpl_file_path)
        }
      })
    },

    async read(file: string): Promise<string | string[] | void> {
      if (await Path(file).isFile()) {
        return readFile(file, 'utf-8')
      } else if (await Path(file).isDirectory()) {
        return readdir(file)
      }
    },

    async write(file_path: string): Promise<void> {
      const filename = basename(file_path)
      const file = (await this.read(file_path)) as string
      Object.keys(this.data).forEach(async (key) => {
        const ptrn_key = this.pattern(key)
        if (ptrn_key.test(file)) {
          writeFile(file_path, file.replace(ptrn_key, this.data[key]), 'utf-8')
        }
        if (ptrn_key.test(filename)) {
          rename(
            file_path,
            join(
              file_path.split(filename).at(0) as string,
              `${this.data[key]}${extname(filename)}`
            )
          )
        }
      })
    }
  }
}
