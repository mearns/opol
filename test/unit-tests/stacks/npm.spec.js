/* eslint-env mocha */
/* eslint no-unused-expressions: off */

// modules under test
import * as opol from '../../../src'

// Support
import path from 'path'
import {opolTest} from '../../../test-util'
import chai, {expect} from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('the npm stack', () => {
  it('should generate a package.json file', () => {
    // given
    const TEST_PROJECT_NAME = 'test-project-123'
    const TEST_PROJECT_VERSION_STRING = '1.2.3'

    // Expect
    opolTest()
      .usingStubbedFileResource()
      .withStack('npm')
      .withConfig('project.name', TEST_PROJECT_NAME)
      .withConfig('project.version', TEST_PROJECT_VERSION_STRING)
      .testConverge()
      .then(({stubbedFileResource: {mkdirpStub, writeFileStub}}) => {
        expect(mkdirpStub).to.have.been.calledOnceWithExactly(path.resolve('./'))
        expect(writeFileStub).to.have.been.calledOnceWithExactly(
          path.resolve('package.json'),
          JSON.stringify({
            name: TEST_PROJECT_NAME,
            version: TEST_PROJECT_VERSION_STRING
          }, null, 4)
        )
      })
  })

  describe('NpmPackageName resource', () => {
    it('should configure the name property in the generated package.json file', () => {
      // given
      const CONFIGURED_PROJECT_NAME = 'this-is-NOT-the-package-name'
      const TEST_PACKAGE_NAME = 'this-IS-the-package-name'
      const TEST_PROJECT_VERSION_STRING = '1.2.3'

      // Expect
      return opolTest()
        .usingStubbedFileResource()
        .withStack('npm')
        .withConfig('project.name', CONFIGURED_PROJECT_NAME)
        .withConfig('project.version', TEST_PROJECT_VERSION_STRING)
        .withExerciser(({resource}) => {
          resource('NpmPackageName')(TEST_PACKAGE_NAME)
        })
        .testConverge()
        .then(({stubbedFileResource: {mkdirpStub, writeFileStub}}) => {
          expect(mkdirpStub).to.have.been.calledOnceWithExactly(path.resolve('./'))
          expect(writeFileStub).to.have.been.calledOnceWithExactly(
            path.resolve('package.json'),
            JSON.stringify({
              name: TEST_PACKAGE_NAME,
              version: TEST_PROJECT_VERSION_STRING
            }, null, 4)
          )
        })
    })
  })
})
