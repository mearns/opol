import * as defaultResources from './resources/_default'
import Promise from 'bluebird'
import {Resource} from './resource'
import get from 'lodash.get'

export function converge (...args) {
  return (new Opol(...args)).converge()
}

const NOOP = () => {}
const IDENTITY = x => x

/**
 * The default stack provides the default resources.
 */
function getDefaultStack (config) {
  return {
    converge: NOOP,
    provideResources: provide => {
      Object.keys(defaultResources).forEach(resName => provide(resName, defaultResources[resName]))
    }
  }
}

/**
 * A stack that provides resources with the given provisioning function.
 */
function getCustomProviderStack (provideResources) {
  return {
    provideResources,
    converge: NOOP
  }
}

function createStacksApi (stacks) {
  const numberedStacks = stacks.map((stack, idx) => [idx, stack])
  const reversedStacks = [...numberedStacks].reverse()
  return {
    anyOrder: (visitor = IDENTITY) => numberedStacks.map(([stackId, stack]) => visitor(stack, stackId)),
    topDown: (visitor = IDENTITY) => numberedStacks.map(([stackId, stack]) => visitor(stack, stackId)),
    bottomUp: (visitor = IDENTITY) => reversedStacks.map(([stackId, stack]) => visitor(stack, stackId))
  }
}

class Opol {
  constructor (config, {provideResources = NOOP} = {}) {
    this._config = config
    this._stacks = createStacksApi([
      getDefaultStack(),
      getCustomProviderStack(provideResources),
      ...((config.stacks || []).map(spec => this.loadStack(spec)))
    ])
    this._resources = {}
    this.loadResourcesFromStacks()
  }

  registerResource (stackId, name, resource) {
    if (resource.prototype instanceof Resource) {
      this._resources[name] = {stackId, Resource: resource}
    } else {
      throw new TypeError(`Resource ${name} must be an instance of 'Resource'`)
    }
  }

  loadResourcesFromStacks () {
    this._stacks.anyOrder((stack, stackId) => {
      stack.provideResources((name, resource) => this.registerResource(stackId, name, resource))
    })
  }

  converge () {
    // Define an API function for getting a config value.
    const config = (path, defVal) => get(this._config, path, defVal)

    // Define an API function for getting a resource (instance) by name
    let stage
    const resources = {}
    const resourceUsages = []
    const resource = (name) => (...args) => {
      if (stage !== 'prep-and-validation') {
        throw new Error(`Resources cannot be run outside of the prep-and-validation stage (attempted to run resource ${name})`)
      }
      const res = resources[name]
      if (!res) {
        throw new Error(`No such resource: '${name}'`)
      }
      res.prepAndValidateInstance(...args)
      resourceUsages.push([name, res, args])
    }

    // Create shared state for each stack.
    const stateByStackId = {}
    this._stacks.anyOrder((_, stackId) => {
      stateByStackId[stackId] = {}
    })

    // Create instances of each resource for this run.
    Object.keys(this._resources).forEach(resName => {
      const {stackId, Resource} = this._resources[resName]
      const sharedStackState = stateByStackId[stackId]
      const stateApi = {
        set: (key, value) => (sharedStackState[key] = value),
        get: key => sharedStackState[key]
      }
      const res = new Resource(stateApi)
      // Add a resource method.
      res.resource = function (name) { return resource(name) }
      resources[resName] = res
    }, {})

    // Run the stacks.
    stage = 'prep-and-validation'
    this._stacks.bottomUp(stack => stack.converge({config, resource}))

    // Run executions for all resource usages.
    stage = 'execution'
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
