import semver from 'semver'
require('babel-polyfill')

export function range (expression) {
  if (expression instanceof _Range) {
    return expression
  }
  return new _Range(...(expression.trim().split('||').map(comparatorSet)))
}

export function intersection (...ranges) {
  return ranges.reduce((intersection, r) => {
    if (intersection) {
      return intersection.intersectWith(r)
    }
    return range(r)
  }, null)
}

class _Range {
  constructor (...comparatorSets) {
    this.comparatorSets = comparatorSets.filter(Boolean)
  }

  intersectWith (_range2) {
    const range2 = range(_range2).simplify()
    const crossProducts = this.simplify().comparatorSets.reduce((pairs, cs) => {
      return [...pairs, ...(range2.comparatorSets.map(cs2 => [cs, cs2]))]
    }, [])
    return new _Range(...(crossProducts.map(([cs1, cs2]) => {
      try {
        return cs1.intersectWith(cs2)
      } catch (e) {
        if (e instanceof EmptyIntersectionError) {
          return null
        }
        throw e
      }
    }))).simplify()
  }

  toString () {
    return this.comparatorSets.map(cs => cs.toString()).join(' || ')
  }

  isSatisfiedBy (version) {
    return this.comparatorSets.some(cs => cs.isSatisfiedBy(version))
  }

  /**
   * Offers a somewhat simplified version of this range. This is
   * guaranteed to be a full reduction. For instance, you could have
   * comparatorSets in the range that are mutually exclusive, which would
   * make the fully simplified range an empty range (no staisfying
   * versions). Similarly, we could comparatorSets that are fully contained
   * by other comparatorSets, making the contained set redudant. The current
   * implementation doesn't simplify either of these.
   */
  simplify () {
    const comparatorSets = this.comparatorSets.map(cs => {
      try {
        return cs.simplify()
      } catch (e) {
        if (e instanceof EmptyIntersectionError) {
          return null
        }
        throw e
      }
    }).filter(Boolean)
    if (comparatorSets.length === 0) {
      throw new EmptyIntersectionError(`The simplified range produces only empty intersections: ${this.toString()}`)
    }
    return new _Range(...comparatorSets)
  }
}

function comparatorSet (expression) {
  if (expression instanceof _ComparatorSet) {
    return expression
  }
  return new _ComparatorSet(...(expression.trim().split(/\s+/).map(comparator)))
}

class _ComparatorSet {
  constructor (...comparators) {
    this.comparators = comparators.filter(Boolean)
  }

  isSatisfiedBy (version) {
    return this.comparators.every(c => c.isSatisfiedBy(version))
  }

  toString () {
    return this.comparators.map(c => c.toString()).join(' ')
  }

  /**
   * Return a new ComparatorSet which is the intersection of this and the given
   * comparator set. This means that any version which satisfies the returned CS will
   * necessarily satisfy this set as well as the `other` set. Returns null for an
   * empty intersection.
   *
   * @param {ComparatorSet} other
   */
  intersectWith (other) {
    return new _ComparatorSet(...this.comparators, ...comparatorSet(other).comparators).simplify()
  }

  /**
   * Reduce this comparator set to a new comparator set with at most two comparators: one that
   * specifies a lower bounds, and one that specifies an upper bounds.
   */
  simplify () {
    const lowerBounds = this.comparators.reduce((lowerBounds, current) => current.getStrictestLowerBound(lowerBounds), null)
    const upperBounds = this.comparators.reduce((upperBounds, current) => current.getStrictestUpperBound(upperBounds), null)
    if (lowerBounds && upperBounds) {
      const lowerVersion = lowerBounds.version
      const upperVersion = upperBounds.version
      if (semver.lt(upperVersion, lowerVersion) || semver.gt(lowerVersion, upperVersion)) {
        throw new EmptyIntersectionError(`Comparator simplifies to an empty intersection: ${lowerBounds.toString()} ${upperBounds.toString()}`)
      }
      if (semver.eq(lowerVersion, upperVersion)) {
        if (lowerBounds.isSatisfiedBy(upperVersion) && upperBounds.isSatisfiedBy(lowerVersion)) {
          return new _ComparatorSet(new EQ(lowerVersion))
        }
        throw new EmptyIntersectionError(`Comparator simplifies to an empty intersection: ${lowerBounds.toString()} ${upperBounds.toString()}`)
      }
    }
    return new _ComparatorSet(...([lowerBounds, upperBounds].filter(x => x !== null)))
  }
}

export class EmptyIntersectionError extends Error {
  constructor (...args) {
    super(...args)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

class _Comparator {
  constructor (version) {
    this.version = version
  }
}

class _UnboundedBelow extends _Comparator {
  getLowerBound () { return null }
  getStrictestLowerBound (other) {
    if (!other) {
      return null
    }
    return other.getLowerBound()
  }
}
class _UnboundedAbove extends _Comparator {
  getUpperBound () { return null }
  getStrictestUpperBound (other) {
    if (!other) {
      return null
    }
    return other.getUpperBound()
  }
}

class LT extends _UnboundedBelow {
  toString () {
    return `<${this.version}`
  }
  isSatisfiedBy (version) {
    return semver.lt(version, this.version)
  }
  getUpperBound () {
    return this
  }
  getStrictestUpperBound (other) {
    if (!other) {
      return this
    }
    const oub = other.getUpperBound()
    if (oub === null) {
      return this
    }
    return (semver.lte(this.version, oub.version)) ? this : oub
  }
}
class LTE extends _UnboundedBelow {
  toString () {
    return `<=${this.version}`
  }
  isSatisfiedBy (version) {
    return semver.lte(version, this.version)
  }
  getUpperBound () {
    return this
  }
  getStrictestUpperBound (other) {
    if (!other) {
      return this
    }
    const oub = other.getUpperBound()
    if (oub === null) {
      return this
    }
    return (semver.lt(this.version, oub.version)) ? this : oub
  }
}
class GT extends _UnboundedAbove {
  toString () {
    return `>${this.version}`
  }
  isSatisfiedBy (version) {
    return semver.gt(version, this.version)
  }
  getLowerBound () {
    return this
  }
  getStrictestLowerBound (other) {
    if (!other) {
      return this
    }
    const oub = other.getLowerBound()
    if (oub === null) {
      return this
    }
    return (semver.gte(this.version, oub.version)) ? this : oub
  }
}
class GTE extends _UnboundedAbove {
  toString () {
    return `>=${this.version}`
  }
  isSatisfiedBy (version) {
    return semver.gte(version, this.version)
  }
  getLowerBound () {
    return this
  }
  getStrictestLowerBound (other) {
    if (!other) {
      return this
    }
    const oub = other.getLowerBound()
    if (oub === null) {
      return this
    }
    return (semver.gt(this.version, oub.version)) ? this : oub
  }
}
class EQ extends _Comparator {
  toString () {
    return `${this.version}`
  }
  isSatisfiedBy (version) {
    return semver.eq(version, this.version)
  }
  getUpperBound () {
    return this
  }
  getLowerBound () {
    return this
  }
  getStrictestUpperBound (other) {
    return this.getStrictestBound(other)
  }
  getStrictestLowerBound (other) {
    return this.getStrictestBound(other)
  }
  getStrictestBound (other) {
    if (!other || other.isSatisfiedBy(this.version)) {
      return this
    }
    throw new EmptyIntersectionError(`${this.toString()} U ${other.toString()}`)
  }
}

function comparator (expression) {
  const match = /([<>]?=?)(.*)/.exec(expression.trim())
  if (!match) {
    throw new Error(`Invalid semver comparator: ${expression}`)
  }
  const operator = match[1]
  const version = semver.valid(match[2])
  if (!version) {
    throw new Error(`Invalid semver version: ${match[2]}`)
  }

  const OperatorClass = {
    '<': LT,
    '>': GT,
    '<=': LTE,
    '>=': GTE,
    '=': EQ,
    '': EQ
  }[operator]
  return new OperatorClass(version)
}
