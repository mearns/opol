import fs from 'mz/fs'

export function jsonFileResource ({path, contentBody = {}, replacer = null, space = 4}) {
  return () => fs.writeFile(path, JSON.stringify(contentBody, replacer, space))
}
