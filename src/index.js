import * as defaultResources from './resources/_default'
import Promise from 'bluebird'
import {Resource} from './resource'

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
    if (resource.prototype instanceof Resource) {
      this._resources[name] = resource
    } else {
      throw new TypeError(`Resource ${name} must be an instance of 'Resource'`)
    }
  }

  loadResourcesFromStacks () {
    const provide = (name, resource) => this.registerResource(name, resource)
    this._stacks.anyOrder(stack => stack.provideResources(provide))
  }

  converge () {
    const resources = Object.keys(this._resources).reduce((acc, resName) => {
      acc[resName] = new (this._resources[resName])()
      return acc
    }, {})
    const resourceUsages = []
    const resource = (name) => (...args) => {
      const res = resources[name]
      if (!res) {
        throw new Error(`No such resource: '${name}'`)
      }
      res.prepAndValidateInstance(...args)
      resourceUsages.push([name, res, args])
    }
    this._stacks.bottomUp(stack => stack.converge({resource}))
    const resourcePromises = {}
    resourceUsages.forEach(([name, res, args]) => {
      if (!resourcePromises[name]) {
        resourcePromises[name] = Promise.method(res.beforeExecute).bind(res)()
      }
      resourcePromises[name] = resourcePromises[name].then(() => res.executeInstance(...args))
    })
    return Promise.map(Object.keys(resourcePromises), name => resources[name].afterExecute())
  }

  loadStack (spec) {
    return require(`./stacks/${spec}.js`)
  }
}
