/* eslint-env mocha */
/* eslint no-unused-expressions: off */

// modules under test
import * as opol from '../../src'

// Support
import path from 'path'
import {File} from '../../src/resources/file'
import chai, {expect} from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('the npm stack', () => {
  it('should generate a package.json file', () => {
    // given
    const mkdirpSpy = sinon.stub().returns(Promise.resolve())
    const writeFileSpy = sinon.stub().returns(Promise.resolve())
    class MockFileResource extends File {
      constructor () {
        super({writeFile: writeFileSpy, mkdirp: mkdirpSpy})
      }
    }
    const TEST_PROJECT_NAME = 'test-project-123'
    const TEST_PROJECT_VERSION_STRING = '1.2.3'
    const testConfig = {
      stacks: ['npm'],
      project: {
        name: TEST_PROJECT_NAME,
        version: TEST_PROJECT_VERSION_STRING
      }
    }

    // when
    return opol.converge(testConfig, {
      provideResources: (provide) => {
        provide('File', MockFileResource)
      }
    })
      .then(() => {
        // then
        expect(mkdirpSpy).to.have.been.calledOnceWithExactly(path.resolve('./'))
        expect(writeFileSpy).to.have.been.calledOnceWithExactly(
          path.resolve('package.json'),
          JSON.stringify({
            name: TEST_PROJECT_NAME,
            version: TEST_PROJECT_VERSION_STRING
          }, null, 4)
        )
      })
  })
})
