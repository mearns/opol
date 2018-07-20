/* eslint-env mocha */
/* eslint no-unused-expressions: off */

// modules under test
import * as resource from '../../src/resource'

// Support
import chai, {expect} from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('the resource module', () => {
  describe('simpleResource', () => {
    it('should create a new class which is a subclass of Resource', () => {
      // when
      const GeneratedResource = resource.simpleResource(() => {})

      // then
      expect(GeneratedResource.prototype).to.be.instanceof(resource.Resource)
    })

    it('should create a new class whose instances are instances of Resource', () => {
      // when
      const GeneratedResource = resource.simpleResource(() => {})
      const testResource = new GeneratedResource({})

      // then
      expect(testResource).to.be.instanceof(GeneratedResource)
      expect(testResource).to.be.instanceof(resource.Resource)
    })

    it('should create a new class whose executeInstance method invokes the provided executor', () => {
      // given
      const executorSpy = sinon.spy()
      const GeneratedResource = resource.simpleResource(executorSpy)
      const testResource = new GeneratedResource({})

      // when
      testResource.executeInstance()

      // then
      expect(executorSpy).to.have.been.calledOnce
    })
  })
})
