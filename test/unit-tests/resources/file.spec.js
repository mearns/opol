/* eslint-env mocha */
/* eslint no-unused-expressions: off */

// modules under test
import {File} from '../../../src/resources/file'

// Support
import {opolTest} from '../../../test-util'
import path from 'path'
import chai, {expect} from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('the file resource', () => {
  it('should use the provided dependencies to write to the file', () => {
    // given
    const TEST_PATH = 'rel/path/to/file.ext'
    const TEST_CONTENT = 'this is the expected test content'
    const EXPECTED_PATH = path.resolve(TEST_PATH)
    const EXPECTED_DIR = path.resolve('rel/path/to/')

    // expect
    return testFileResource((fileResource) => {
      fileResource({path: TEST_PATH, content: TEST_CONTENT})
    }).then(({mkdirpStub, writeFileStub}) => {
      expect(mkdirpStub).to.have.been.calledOnceWithExactly(EXPECTED_DIR)
      expect(writeFileStub).to.have.been.calledOnceWithExactly(EXPECTED_PATH, TEST_CONTENT)
    })
  })
})

function testFileResource (when) {
  const writeFileStub = sinon.stub().returns(Promise.resolve())
  const mkdirpStub = sinon.stub().returns(Promise.resolve())

  class MockFileResource extends File {
    constructor (api) {
      super(api, {writeFile: writeFileStub, mkdirp: mkdirpStub})
    }
  }

  // when
  return opolTest()
    .withMockResource('File', MockFileResource)
    .withExerciser(({resource}) => {
      when(resource('File'))
    })
    .testConverge()
    .then(() => ({writeFileStub, mkdirpStub}))
}
