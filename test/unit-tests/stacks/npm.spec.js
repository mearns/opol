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

  describe('NpmPackageVersion resource', () => {
    it('should configure the version property in the generated package.json file', () => {
      // given
      const TEST_PACKAGE_NAME = 'test-package-abc'
      const CONFIGURED_PROJECT_VERSION = '1.2.3'
      const TEST_PACKAGE_VERSION = '9.8.5'

      // Expect
      return opolTest()
        .usingStubbedFileResource()
        .withStack('npm')
        .withConfig('project.name', TEST_PACKAGE_NAME)
        .withConfig('project.version', CONFIGURED_PROJECT_VERSION)
        .withExerciser(({resource}) => {
          resource('NpmPackageVersion')(TEST_PACKAGE_VERSION)
        })
        .testConverge()
        .then(({stubbedFileResource: {mkdirpStub, writeFileStub}}) => {
          expect(mkdirpStub).to.have.been.calledOnceWithExactly(path.resolve('./'))
          expect(writeFileStub).to.have.been.calledOnceWithExactly(
            path.resolve('package.json'),
            JSON.stringify({
              name: TEST_PACKAGE_NAME,
              version: TEST_PACKAGE_VERSION
            }, null, 4)
          )
        })
    })
  })

  describe('NpmDependency resource', () => {
    it('should add the specified version of a dependency to the package.json file', () => {
      // given
      const PACKAGE_NAME = 'some-other-package'
      const PACKAGE_VERSION = '7.5.0'

      // Expect
      return opolTest()
        .usingStubbedFileResource()
        .withStack('npm')
        .withExerciser(({resource}) => {
          resource('NpmDependency')(PACKAGE_NAME, PACKAGE_VERSION)
        })
        .testConverge()
        .then(({stubbedFileResource: {mkdirpStub, writeFileStub}}) => {
          expect(writeFileStub).to.have.been.calledOnceWithExactly(
            path.resolve('package.json'),
            sinon.match.packageJson(sinon.match({
              dependencies: sinon.match({
                [PACKAGE_NAME]: PACKAGE_VERSION
              })
            }))
          )
        })
    })
  })
})

sinon.match.packageJson = function packageJson (matcher) {
  return sinon.match(packageJson => matcher.test(JSON.parse(packageJson)))
}
