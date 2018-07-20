import * as opol from '../src'
import sinon from 'sinon'
import {File} from '../src/resources/file'

export function opolTest () {
  return new OpolTest()
}

class OpolTest {
  constructor () {
    this._overrideResources = []
    this._exercisers = []
    this._api = {}
  }

  withMockResource (name, mock) {
    this._overrideResources.push({name, mock})
    return this
  }

  withExerciser (exerciser) {
    this._exercisers.push(exerciser)
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
    const testStacks = this._exercisers.map((exc, idx) => ({
      name: `__test-exerciser-stack-${idx}__`,
      provideResources: () => {},
      converge: exc
    }))
    return opol.converge(
      {stacks: testStacks},
      {
        provideResources: provide => {
          this._overrideResources.forEach(({name, mock}) => provide(name, mock))
        }
      }
    ).then(() => this._api)
  }
}
