/* eslint-env mocha */
/* eslint no-unused-expressions: off */

// Support
import {opolTest} from '../../../test-util'
import chai, {expect} from 'chai'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('the npm stack', () => {
  it('should generate a package.json file', () => {
    // given
    const TEST_PROJECT_NAME = 'test-project-123'
    const TEST_PROJECT_VERSION_STRING = '1.2.3'

    // Expect
    opolTest()
      .withStack('npm')
      .withConfig('project.name', TEST_PROJECT_NAME)
      .withConfig('project.version', TEST_PROJECT_VERSION_STRING)
      .testConverge()
      .then(({fs}) => {
        const packageData = fs.readJsonSync('./package.json')
        expect(packageData).to.have.property('name', TEST_PROJECT_NAME)
        expect(packageData).to.have.property('version', TEST_PROJECT_VERSION_STRING)
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
        .withStack('npm')
        .withConfig('project.name', CONFIGURED_PROJECT_NAME)
        .withConfig('project.version', TEST_PROJECT_VERSION_STRING)
        .withExerciser(({resource}) => {
          resource('NpmPackageName')(TEST_PACKAGE_NAME)
        })
        .testConverge()
        .then(({fs}) => {
          const packageData = fs.readJsonSync('./package.json')
          expect(packageData).to.have.property('name', TEST_PACKAGE_NAME)
          expect(packageData).to.have.property('version', TEST_PROJECT_VERSION_STRING)
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
        .withStack('npm')
        .withConfig('project.name', TEST_PACKAGE_NAME)
        .withConfig('project.version', CONFIGURED_PROJECT_VERSION)
        .withExerciser(({resource}) => {
          resource('NpmPackageVersion')(TEST_PACKAGE_VERSION)
        })
        .testConverge()
        .then(({fs}) => {
          const packageData = fs.readJsonSync('./package.json')
          expect(packageData).to.have.property('name', TEST_PACKAGE_NAME)
          expect(packageData).to.have.property('version', TEST_PACKAGE_VERSION)
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
        .withStack('npm')
        .withExerciser(({resource}) => {
          resource('NpmDependency')(PACKAGE_NAME, PACKAGE_VERSION)
        })
        .testConverge()
        .then(({fs}) => {
          const packageData = fs.readJsonSync('./package.json')
          expect(packageData).to.have.property('dependencies')
          expect(packageData.dependencies).to.have.property(PACKAGE_NAME, PACKAGE_VERSION)
        })
    })

    it('should form an intersection of specified version constraints when the same dependency is added multiple times.', () => {
      // given
      const PACKAGE_NAME = 'some-package'

      // Expect
      return opolTest()
        .withStack('npm')
        .withExerciser(({resource}) => {
          resource('NpmDependency')(PACKAGE_NAME, '<1.0.0 || >3.0.0 || >=4.0.0 <6.0.0')
          resource('NpmDependency')(PACKAGE_NAME, '>=3.5.0 || <7.0.0')
        })
        .testConverge()
        .then(({fs}) => {
          const packageData = fs.readJsonSync('./package.json')
          expect(packageData).to.have.property('dependencies')
          expect(packageData.dependencies).to.have.property(PACKAGE_NAME,
            '<1.0.0 || >=3.5.0 || >3.0.0 <7.0.0 || >=4.0.0 <6.0.0 || >=4.0.0 <6.0.0')
        })
    })
  })
})
