import {Resource} from '../resource'
import fs from 'mz/fs'
import fsExtra from 'fs-extra'
import pathUtil from 'path'
import Promise from 'bluebird'

export class File extends Resource {
  constructor ({writeFile = fs.writeFile, mkdirp = fsExtra.mkdirp}) {
    super()
    this.writeFile = writeFile
    this.mkdirp = mkdirp
  }

  prepAndValidateInstance ({path, content}) {
    const fileState = this.state.get('files') || {}
    const fileWriteState = fileState.write || {}
    fileWriteState[pathUtil.resolve(path)] = content
    fileState.write = fileWriteState
    this.state.set('files', fileState)
  }

  afterExecute () {
    const fileState = this.state.get('files') || {}
    const fileWriteState = fileState.write || {}
    return Promise.map(Object.keys(fileWriteState), path => {
      const _content = fileWriteState[path]
      const content = (typeof _content === 'function') ? _content() : _content
      return this.mkdirp(pathUtil.dirname(path))
        .then(() => this.writeFile(path, content))
    })
  }
}
