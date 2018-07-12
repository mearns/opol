import get from 'lodash.get'
import * as defaultResources from './resources/_default'
import Promise from 'bluebird'

const NOOP = () => {}
const IDENTITY = x => x

export function converge (config, options) {
  return (new Opol(config, options)).converge()
}

function getDefaultStack () {
  return {
    converge: NOOP,
    provideResources: provide => {
      Object.keys(defaultResources).forEach(resName => provide(resName, defaultResources[resName]))
    }
  }
}

function getCustomProviderStack (provideResources) {
  return {
    provideResources,
    converge: NOOP
  }
}

class Opol {
  constructor (config, {provideResources = NOOP} = {}) {
    this._config = config
    const stacks = [
      getDefaultStack(),
      getCustomProviderStack(provideResources),
      ...((config.stacks || []).map(spec => this.loadStack(spec)))
    ]
    const reversedStacks = [...stacks].reverse()
    this._stacks = {
      anyOrder: (visitor = IDENTITY) => stacks.map(visitor),
      topDown: (visitor = IDENTITY) => stacks.map(visitor),
      bottomUp: (visitor = IDENTITY) => reversedStacks.map(visitor)
    }
    this._resources = {}
    this.loadResourcesFromStacks()
  }

  registerResource (name, resource) {
    this._resources[name] = (registerCallback, ...args) => {
      const res = resource(...args)
      if (!res || (typeof res !== 'function')) {
        throw new Error(`Resource ${name} did not return a callback function as required.`)
      }
      registerCallback(res)
    }
  }

  loadResourcesFromStacks () {
    const provide = (name, resource) => this.registerResource(name, resource)
    this._stacks.anyOrder(stack => stack.provideResources(provide))
  }

  converge () {
    const resourceCallbacks = []
    const registerCallback = callback => { resourceCallbacks.push(callback) }
    const resource = (name) => (...args) => { this._resources[name](registerCallback, ...args) }
    const config = (path, def) => get(this._config, path, def)
    this._stacks.bottomUp(stack => stack.converge({config, resource}))
    return Promise.map(resourceCallbacks, cb => cb())
  }

  loadStack (spec) {
    return require(`./stacks/${spec}.js`)
  }
}
