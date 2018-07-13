import * as defaultResources from './resources/_default'
import Promise from 'bluebird'
import {Resource} from './resource'
import get from 'lodash.get'

const NOOP = () => {}
const IDENTITY = x => x

function getDefaultStack (config) {
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

export function converge (...args) {
  return (new Opol(...args)).converge()
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
    // Define an API function for getting a config value.
    const config = (path, defVal) => get(this._config, path, defVal)

    // Define an API function for getting a resource (instance) by name
    const resources = {}
    const resourceUsages = []
    const resource = (name) => (...args) => {
      const res = resources[name]
      if (!res) {
        throw new Error(`No such resource: '${name}'`)
      }
      res.prepAndValidateInstance(...args)
      resourceUsages.push([name, res, args])
    }

    // Create instances of each resource for this run.
    Object.keys(this._resources).forEach(resName => {
      const res = new (this._resources[resName])()
      // Add a resource method.
      res.resource = function (name) { return resource(name) }
      resources[resName] = res
    }, {})

    // Run the stacks.
    this._stacks.bottomUp(stack => stack.converge({config, resource}))

    // Run executions for all resource usages.
    const resourcePromises = {}
    resourceUsages.forEach(([name, res, args]) => {
      if (!resourcePromises[name]) {
        resourcePromises[name] = Promise.method(res.beforeExecute).bind(res)()
      }
      resourcePromises[name] = resourcePromises[name].then(() => res.executeInstance(...args))
    })

    // Wait for all executions to complete.
    return Promise.map(Object.keys(resourcePromises), name => resources[name].afterExecute())
  }

  loadStack (spec) {
    return require(`./stacks/${spec}.js`)
  }
}
