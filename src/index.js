import get from 'lodash.get'

const NOOP = () => {}
const IDENTITY = x => x

export function converge (config, options) {
  return (new Opol(config, options)).converge()
}

function getDefaultStack (provideResources) {
  return {
    provideResources,
    converge: NOOP
  }
}

class Opol {
  constructor (config, {provideResources = NOOP} = {}) {
    this._config = config
    const stacks = [
      getDefaultStack(provideResources),
      ...((config.stacks || []).map(spec => this.loadStack(spec)))
    ]
    const reversedStacks = [...stacks].reverse()
    this._stacks = {
      anyOrder: (visitor = IDENTITY) => stacks.map(visitor),
      topDown: (visitor = IDENTITY) => stacks.map(visitor),
      bottomUp: (visitor = IDENTITY) => reversedStacks.map(visitor)
    }
    this._resources = this.initResources()
  }

  initResources () {
    const resources = {}
    const provide = (name, resource) => { resources[name] = (...args) => resource(...args) }
    this._stacks.anyOrder(stack => stack.provideResources(provide))
    return resources
  }

  converge () {
    const resource = (name) => this._resources[name]
    const config = (path, def) => get(this._config, path, def)
    this._stacks.bottomUp(stack => stack.converge({config, resource}))
  }

  loadStack (spec) {
    return require(`./stacks/${spec}.js`)
  }
}
