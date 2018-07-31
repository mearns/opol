/* eslint-env mocha */
/* eslint no-unused-expressions: off */

// Support
import {Resource} from '../../../src/resource'
import {opolTest} from '../../../test-util'
import path from 'path'
import chai, {expect} from 'chai'
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
    }).then(({stubbedFileResource: {mkdirpStub, writeFileStub}}) => {
      expect(mkdirpStub).to.have.been.calledOnceWithExactly(EXPECTED_DIR)
      expect(writeFileStub).to.have.been.calledOnceWith(EXPECTED_PATH, TEST_CONTENT)
    })
  })

  it('should write the last content provided for each file', () => {
    // given
    const TEST_PATH = 'rel/path/to/file.ext'
    const TEST_CONTENT_1 = 'here is an early version'
    const TEST_CONTENT_2 = 'here is another version'
    const TEST_CONTENT_FINAL = 'this is the expected test content'
    const EXPECTED_PATH = path.resolve(TEST_PATH)

    // expect
    return testFileResource((fileResource) => {
      fileResource({path: TEST_PATH, content: TEST_CONTENT_1})
      fileResource({path: TEST_PATH, content: TEST_CONTENT_2})
      fileResource({path: TEST_PATH, content: TEST_CONTENT_FINAL})
    }).then(({stubbedFileResource: {writeFileStub}}) => {
      expect(writeFileStub).to.have.been.calledOnce
      expect(writeFileStub).to.have.been.calledWith(EXPECTED_PATH, TEST_CONTENT_FINAL)
    })
  })

  it('should use a provided function to get the file-contents during the execute stage', () => {
    // given
    const TEST_PATH = 'rel/path/to/file.ext'
    const EXPECTED_PATH = path.resolve(TEST_PATH)
    const EXPECTED_CONTENT = 'this is the expected content'
    class TestResource extends Resource {
      constructor (api) {
        super(api)
        this._content = 'this is the wrong content'
      }

      prepAndValidateInstance () {
        this.resource('File')({path: TEST_PATH, content: () => this._content})
      }

      executeInstance () {
        this._content = EXPECTED_CONTENT
      }
    }

    // when
    return testFileResource(
      () => {},
      opolTest => {
        opolTest.withMockResource('--test-resource--', TestResource)
        opolTest.withExerciser(({resource}) => {
          resource('--test-resource--')()
        })
      }
    )
      .then(({stubbedFileResource: {writeFileStub}}) => {
        expect(writeFileStub).to.have.been.calledOnce
        expect(writeFileStub).to.have.been.calledWith(EXPECTED_PATH, EXPECTED_CONTENT)
      })
  })
})

function testFileResource (when, opolTestSetup = () => {}) {
  const test = opolTest().withExerciser(({resource}) => {
    when(resource('File'))
  })
  opolTestSetup(test)
  return test.testConverge()
}
