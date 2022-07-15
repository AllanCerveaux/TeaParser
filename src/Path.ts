import { Stats, constants } from 'fs'
import { access, copyFile, cp, lstat, mkdir } from 'fs/promises'

/**
 * It returns an object with methods that can be used to access a file or directory
 * @param {string} path - The path to the file or directory.
 * @returns An object with a bunch of methods.
 */
export default function Path(path: string) {
  return {
    path,
    async accessTo() {
      try {
        await access(path)
      } catch (error) {
        this.makeDir()
      }
    },
    typeOfPath: (): Promise<Stats> => {
      return lstat(path)
    },
    async isDirectory(): Promise<boolean> {
      return (await this.typeOfPath()).isDirectory()
    },
    async isFile(): Promise<boolean> {
      return (await this.typeOfPath()).isFile()
    },
    async copy(destination_path: string): Promise<void> {
      if (await this.isDirectory()) {
        return cp(path, destination_path, { recursive: true })
      }
      if (await this.isFile()) {
        return copyFile(path, destination_path, constants.COPYFILE_EXCL)
      }
    },
    async makeDir(): Promise<void> {
      return mkdir(path)
    }
  }
}
