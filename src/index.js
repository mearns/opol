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

function createStateAPIFactory () {
  const state = {}
  return () => ({
    set: (key, value) => (state[key] = value),
    get: key => state[key]
  })
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
    const resource = (name) => {
      if (stage !== 'prep-and-validation') {
        throw new Error(`Resources cannot be accessed outside of the prep-and-validation stage (attempted to access resource ${name})`)
      }
      if (!(this._resources[name])) {
        throw new Error(`Unknown resource "${name}"`)
      }

      const hack = {
        [name]: function (...args) {
          if (stage !== 'prep-and-validation') {
            throw new Error(`Resources cannot be run outside of the prep-and-validation stage (attempted to run resource ${name})`)
          }
          const res = resources[name]
          if (!res) {
            throw new Error(`Internal error: resoure "${name}" was believed to be available, but is not.`)
          }
          res.prepAndValidateInstance(...args)
          resourceUsages.push([name, res, args])
        }
      }
      return hack[name]
    }

    // Create shared state for each stack.
    const stateAPIFactoriesByStackId = {}
    this._stacks.anyOrder((_, stackId) => {
      stateAPIFactoriesByStackId[stackId] = createStateAPIFactory()
    })

    // Create instances of each resource for this run.
    stage = 'resource-instantiation'
    Object.keys(this._resources).forEach(resName => {
      const {stackId, Resource} = this._resources[resName]
      const stateApi = stateAPIFactoriesByStackId[stackId]()
      const res = new Resource({state: stateApi, resource})
      resources[resName] = res
    }, {})

    // Run the stacks.
    stage = 'prep-and-validation'
    this._stacks.topDown((stack, stackId) => stack.converge({state: stateAPIFactoriesByStackId[stackId](), config, resource}))

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
    if (typeof spec === 'string') {
      return require(`./stacks/${spec}.js`)
    } else if (typeof spec === 'object') {
      if (typeof spec.name !== 'string') {
        throw new TypeError('Stack objects must prodive a string "name" property')
      }
      if (typeof spec.provideResources !== 'function') {
        throw new TypeError(`Stack "${spec.name}" is missing the required "provideResources" function`)
      }
      if (typeof spec.converge !== 'function') {
        throw new TypeError(`Stack "${spec.name}" is missing the required "converge" function`)
      }
      return spec
    }
    throw new TypeError(`Unexpected stack-spec: "${spec}"; expected a string (module-name) or an object.`)
  }
}
