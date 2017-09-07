import fs from 'mz/fs'

export function manifest (outputFilePath) {
  return fs.writeFile(outputFilePath, JSON.stringify({}))
}
