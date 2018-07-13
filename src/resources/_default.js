import {simpleResource} from '../resource'
import fs from 'mz/fs'

export const JsonFile = simpleResource('JsonFile', ({path, contentBody, replacer, space}) => {
  return fs.writeFile(path, JSON.stringify(contentBody, replacer, space))
})
