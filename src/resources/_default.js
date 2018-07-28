import {Resource} from '../resource'
import {File as _File} from './file'

export const File = _File

export class JsonFile extends Resource {
  prepAndValidateInstance ({path, contentBody, replacer = null, space = 4, mode}) {
    const content = (typeof contentBody === 'function')
      ? () => JSON.stringify(contentBody(), replacer, space)
      : () => JSON.stringify(contentBody, replacer, space)
    this.resource('File')({path, content, mode})
  }
}
