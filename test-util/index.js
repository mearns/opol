import * as opol from '../src'
import sinon from 'sinon'
import {File} from '../src/resources/file'
import set from 'lodash.set'
import {Volume} from 'memfs'
import process from 'process'
import Promise from 'bluebird'

export function opolTest () {
  return new OpolTest()
}

class OpolTest {
  constructor () {
    this._overrideResources = []
    this._config = {
      stacks: []
    }
    this._useMocks = {
      file: true
    }
    this._api = {}
  }

  withConfig (path, value) {
    if (path === 'stacks') {
      throw new Error('Do not use this function to set the stacks, use .withStack instead')
    }
    set(this._config, path, value)
    return this
  }

  withMockResource (name, mock) {
    this._overrideResources.push({name, mock})
    return this
  }

  withExerciser (exerciser) {
    return this.withStack({
      name: `__test-exerciser-stack-${this._config.stacks.length}-${exerciser.name}__`,
      provideResources: () => {},
      converge: exerciser
    })
  }

  withStack (spec) {
    this._config.stacks.push(spec)
    return this
  }

  usingStubbedFileResource () {
    this._useMocks.file = true
    return this
  }

  withoutStubbedFileResource () {
    this._useMocks.file = false
    return this
  }

  testConverge () {
    if (this._useMocks.file) {
      const shadowFs = new Volume()
      shadowFs.mkdirpSync(process.cwd())

      const writeFileStub = sinon.spy(Promise.promisify(shadowFs.writeFile.bind(shadowFs)))
      const mkdirpStub = sinon.spy(Promise.promisify(shadowFs.mkdirp.bind(shadowFs)))

      class StubbedFileResource extends File {
        constructor (api) {
          super(api, {writeFile: writeFileStub, mkdirp: mkdirpStub})
        }
      }
      this.withMockResource('File', StubbedFileResource)
      this._api.stubbedFileResource = {writeFileStub, mkdirpStub}
      this._api.fs = {...shadowFs, readJsonSync: (...args) => JSON.parse(shadowFs.readFileSync(...args))}
    }

    return opol.converge(
      this._config,
      {
        provideResources: provide => {
          this._overrideResources.forEach(({name, mock}) => provide(name, mock))
        }
      }
    ).then(() => this._api)
  }
}
