import {Resource, simpleResource} from '../resource'
import fs from 'mz/fs'
import get from 'lodash.get'

export const File = simpleResource('File', ({path, content}) => {
  return fs.writeFile(path, content)
})

export class JsonFile extends Resource {
  prepAndValidateInstance ({path, contentBody, replacer = null, space = 4}) {
    this.resource('File')({path, content: JSON.stringify(contentBody, replacer, space)})
  }
}
