import * as opol from '../src'

export function opolTest () {
  return new OpolTest()
}

class OpolTest {
  constructor () {
    this._overrideResources = []
    this._exercisers = []
  }

  withMockResource (name, mock) {
    this._overrideResources.push({name, mock})
    return this
  }

  withExerciser (exerciser) {
    this._exercisers.push(exerciser)
    return this
  }

  testConverge () {
    const testStacks = this._exercisers.map((exc, idx) => ({
      name: `__test-exerciser-stack-${idx}__`,
      provideResources: () => {},
      converge: exc
    }))
    return opol.converge(
      {stacks: testStacks},
      {
        provideResources: provide => {
          this._overrideResources.forEach(({name, mock}) => provide(name, mock))
        }
      }
    )
  }
}
