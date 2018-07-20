import * as opol from '../src'
import sinon from 'sinon'
import {File} from '../src/resources/file'
import set from 'lodash.set'

export function opolTest () {
  return new OpolTest()
}

class OpolTest {
  constructor () {
    this._overrideResources = []
    this._api = {}
    this._config = {
      stacks: []
    }
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
    const writeFileStub = sinon.stub().returns(Promise.resolve())
    const mkdirpStub = sinon.stub().returns(Promise.resolve())

    class StubbedFileResource extends File {
      constructor (api) {
        super(api, {writeFile: writeFileStub, mkdirp: mkdirpStub})
      }
    }
    this.withMockResource('File', StubbedFileResource)
    this._api.stubbedFileResource = {writeFileStub, mkdirpStub}
    return this
  }

  testConverge () {
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
