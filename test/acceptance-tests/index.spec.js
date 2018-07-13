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
    const mockJsonFileResource = simpleResource('MockJsonFile', sinon.stub().returns(() => {}))
    console.log('Mock JSON', mockJsonFileResource)
    const TEST_PROJECT_NAME = 'test-project-123'
    const testConfig = {
      stacks: ['npm'],
      project: {
        name: TEST_PROJECT_NAME
      }
    }

    // when
    // XXX: FIXME: TODO: NEed to wait for converge to settle.
    opol.converge(testConfig, {
      provideResources: (provide) => {
        provide('JsonFile', mockJsonFileResource)
      }
    })

    // then
    expect(mockJsonFileResource).to.have.been.calledWith(sinon.match({
      path: 'package.json',
      contentBody: {
        name: TEST_PROJECT_NAME
      }
    }))
  })
})
