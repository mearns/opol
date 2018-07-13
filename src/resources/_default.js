import {Resource, simpleResource} from '../resource'
import fs from 'mz/fs'

export const JsonFile = simpleResource('JsonFile', ({path, contentBody, replacer, space}) => {
  return fs.writeFile(path, JSON.stringify(contentBody, replacer, space))
})

// export class JsonFile extends Resource {
  // executeInstance ({path, contentBody, replacer = null, space = 4}) {
    // return fs.writeFile(path, JSON.stringify(contentBody, replacer, space))
  // }
// }
