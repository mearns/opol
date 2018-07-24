/* eslint-env mocha */
/* eslint no-unused-expressions: off */

// Module under test
import * as semverUtil from '../../../src/util/semver-util'

// Support
import {expect, Assertion} from 'chai'

Assertion.addMethod('satisfiedBy', function (version) {
  const range = semverUtil.range(this._obj)
  this.assert(
    range.isSatisfiedBy(version),
    `expected #{this} to be satisfied by version "${version}"`,
    `expected #{this} to not be satisfied by version "${version}"`
  )
})

describe('the semver-util package', () => {

  describe('combined sets', () => {
    it('should be satisfied by a version that satisfies both ranges', () => {
      expect(semverUtil.intersection('<1.0.0 || >1.5.0', '>0.5.0 <0.7.0 || >2.0.0 <4.0.0')).to.be.satisfiedBy('0.6.1')
      expect(semverUtil.intersection('<1.0.0 || >1.5.0', '>0.5.0 <0.7.0 || >2.0.0 <4.0.0')).to.be.satisfiedBy('3.5.0')
    })

    it('should not be satisfied by a version that only satisfied one range', () => {
      expect(semverUtil.intersection('<1.0.0 || >1.5.0', '>0.5.0 <0.7.0 || >2.0.0 <4.0.0')).to.be.not.satisfiedBy('0.0.1')
      expect(semverUtil.intersection('<1.0.0 || >1.5.0', '>0.5.0 <0.7.0 || >2.0.0 <4.0.0')).to.be.not.satisfiedBy('5.1.2')
    })
  })

  describe('a composite range', () => {
    it('should be satisfied by a version that satisfied either comparator set', () => {
      expect('<=1.2.3 || >5.6.7').to.be.satisfiedBy('1.2.3')
      expect('<=1.2.3 || >5.6.7').to.be.satisfiedBy('5.7.0')
    })

    it('should not be satisfied by a range that does not satisfy either comparator set', () => {
      expect('<=1.2.3 || >=5.6.7 <7.0.1').to.be.not.satisfiedBy('2.0.0')
      expect('<=1.2.3 || >=5.6.7 <7.0.1').to.be.not.satisfiedBy('7.0.2')
    })

    it('should be satisfied by a version that satisfied both comparator sets', () => {
      expect('>=2.0.0 || >1.2.3 <2.0.2').to.be.satisfiedBy('2.0.1')
    })
  })

  describe('a two-ended exclusive range', () => {
    it('should be satisfied by a version that is strictly within the range', () => {
      expect('>1.2.3 <7.8.9').to.be.satisfiedBy('1.2.4')
      expect('>1.2.3 <7.8.9').to.be.satisfiedBy('7.8.8')
      expect('>1.2.3 <7.8.9').to.be.satisfiedBy('2.0.0')
      expect('>1.2.3 <7.8.9').to.be.satisfiedBy('3.1.4')
      expect('>1.2.3 <7.8.9').to.be.satisfiedBy('4.1.4')
      expect('>1.2.3 <7.8.9').to.be.satisfiedBy('5.9.10')
    })

    it('should not be satisfied by a version less than the lower bound', () => {
      expect('>1.2.3 <7.8.9').to.be.not.satisfiedBy('1.2.2')
      expect('>1.2.3 <7.8.9').to.be.not.satisfiedBy('0.0.0')
    })

    it('should not be satisfied by a version equal to the lower bound', () => {
      expect('>1.2.3 <7.8.9').to.be.not.satisfiedBy('1.2.3')
    })

    it('should not be satisfied by a version greater than the upper bound', () => {
      expect('>1.2.3 <7.8.9').to.be.not.satisfiedBy('7.8.10')
      expect('>1.2.3 <7.8.9').to.be.not.satisfiedBy('100.0.0')
    })

    it('should not be satisfied by a version equal to the upper bound', () => {
      expect('>1.2.3 <7.8.9').to.be.not.satisfiedBy('7.8.9')
    })
  })

  describe('an exclusive upper-bounded range', () => {
    it('should be satisfied by a version that is less than the upper bound', () => {
      expect('<7.8.9').to.be.satisfiedBy('1.2.4')
      expect('<7.8.9').to.be.satisfiedBy('7.8.8')
      expect('<7.8.9').to.be.satisfiedBy('2.0.0')
      expect('<7.8.9').to.be.satisfiedBy('3.1.4')
      expect('<7.8.9').to.be.satisfiedBy('4.1.4')
      expect('<7.8.9').to.be.satisfiedBy('5.9.10')
    })
  })

  describe('a contained upper-bounded range', () => {
    it('should be satisfied by a version that is less than the lesser upper bound', () => {
      expect('<3.4.5 <8.9.10').to.be.satisfiedBy('3.4.4')
    })
    it('should not be satisfied by a version that is less than the greater upper bound, but greater than the lesser upper bound', () => {
      expect('<3.4.5 <8.9.10').to.be.not.satisfiedBy('5.1.2')
    })
    it('should not be satisfied by a version that is greater than the greater upper bound', () => {
      expect('<3.4.5 <8.9.10').to.be.not.satisfiedBy('8.9.11')
    })
  })

  describe('the less-than comparator', () => {
    it('should be satisfied if the patch version is less', () => {
      expect('<2.3.4').to.be.satisfiedBy('2.3.3')
    })
    it('should be satisfied if the minor version is less', () => {
      expect('<2.3.4').to.be.satisfiedBy('2.2.4')
    })
    it('should be satisfied if the major version is less', () => {
      expect('<2.3.4').to.be.satisfiedBy('1.3.4')
    })
    it('should not be satisfied by an equal version', () => {
      expect('<2.3.4').to.be.not.satisfiedBy('2.3.4')
    })
    it('should not be satisfied if the patch version is greater', () => {
      expect('<2.3.4').to.be.not.satisfiedBy('2.3.5')
    })
    it('should not be satisfied if the minor version is greater', () => {
      expect('<2.3.4').to.be.not.satisfiedBy('2.4.3')
    })
    it('should not be satisfied if the major version is greater', () => {
      expect('<2.3.4').to.be.not.satisfiedBy('3.2.3')
    })
  })
})
