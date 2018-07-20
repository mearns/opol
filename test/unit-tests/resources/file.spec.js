/* eslint-env mocha */
/* eslint no-unused-expressions: off */

// modules under test
import {File} from '../../../src/resources/file'

// Support
import * as opol from '../../../src'
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
    const writeFileStub = sinon.stub().returns(Promise.resolve())
    const mkdirpStub = sinon.stub().returns(Promise.resolve())

    class MockFileResource extends File {
      constructor (api) {
        super(api, {writeFile: writeFileStub, mkdirp: mkdirpStub})
      }
    }
    const testStack = {
      name: '__test__',
      provideResources: (provide) => {
        provide('File', MockFileResource)
      },
      converge: ({resource}) => {
        resource('File')({path: TEST_PATH, content: TEST_CONTENT})
      }
    }

    // when
    const p = opol.converge({
      stacks: [testStack]
    })

    // then
    return p.then(() => {
      expect(mkdirpStub).to.have.been.calledOnceWithExactly(EXPECTED_DIR)
      expect(writeFileStub).to.have.been.calledOnceWithExactly(EXPECTED_PATH, TEST_CONTENT)
    })
  })
})
