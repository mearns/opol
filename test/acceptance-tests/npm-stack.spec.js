/* eslint-env mocha */
/* eslint no-unused-expressions: off */

// modules under test
import * as opol from '../../src'

// Support
import {simpleResource} from '../../src/resource'
import chai, {expect} from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('the npm stack', () => {
  it('should generate a package.json file', () => {
    // given
    const jsonFileSpy = sinon.spy()
    const MockJsonFileResource = simpleResource('MockJsonFile', jsonFileSpy)
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
        provide('JsonFile', MockJsonFileResource)
      }
    })
      .then(() => {
        // then
        expect(jsonFileSpy).to.have.been.calledWith(sinon.match({
          path: 'package.json',
          contentBody: {
            name: TEST_PROJECT_NAME,
            version: TEST_PROJECT_VERSION_STRING
          }
        }))
      })
  })
})
