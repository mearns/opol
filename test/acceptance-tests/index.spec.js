/* eslint-env mocha */
/* eslint no-unused-expressions: off */

// modules under test
import * as opol from '../../src'

// Support
import chai, {expect} from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('the npm stack', () => {
  it('should generate a package.json file', () => {
    // given
    const mockJsonFileResource = sinon.spy()
    const TEST_PROJECT_NAME = 'test-project-123'
    const testConfig = {
      stacks: ['npm'],
      project: {
        name: TEST_PROJECT_NAME
      }
    }

    // when
    opol.converge(testConfig, {
      provideResources: (provide) => {
        provide('jsonFileResource', mockJsonFileResource)
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
