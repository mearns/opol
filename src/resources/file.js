import {Resource} from '../resource'
import fs from 'mz/fs'
import fsExtra from 'fs-extra'
import pathUtil from 'path'
import Promise from 'bluebird'

export class File extends Resource {
  constructor (api, {writeFile = fs.writeFile, mkdirp = fsExtra.mkdirp}) {
    super(api)
    this.writeFile = writeFile
    this.mkdirp = mkdirp
  }

  prepAndValidateInstance ({path, content}) {
    const fileState = this.state.get('file') || {}
    const dirState = fileState.createDirs || {}
    const fileWriteState = fileState.write || {}

    const absPath = pathUtil.resolve(path)
    const dir = pathUtil.dirname(absPath)
    dirState[dir] = true
    fileWriteState[absPath] = {content, dir}

    fileState.write = fileWriteState
    fileState.createDirs = dirState
    this.state.set('file', fileState)
  }

  afterExecute () {
    const fileState = this.state.get('file') || {}
    const dirState = fileState.createDirs || {}
    const fileWriteState = fileState.write || {}

    const dirPromiseCatalog = Object.keys(dirState).reduce((catalog, dirName) => {
      catalog[dirName] = this.mkdirp(dirName)
      return catalog
    }, {})

    const promiseForAllDirs = Promise.all(Object.values(dirPromiseCatalog))

    const promiseForAllFiles = Promise.map(Object.entries(fileWriteState), ([path, {content: _content, dir}]) => {
      const content = (typeof _content === 'function') ? _content() : _content
      return dirPromiseCatalog[dir]
        .then(() => this.writeFile(path, content))
    })

    return Promise.join(promiseForAllDirs, promiseForAllFiles, () => {})
  }
}
