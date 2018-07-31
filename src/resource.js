
/**
 * The contract for a resource is that it should not make any permanent changes to the host
 * system in the prepAndValidateInstance, and that all state changes to the host are complete
 * by the time the `executeInstance` method is called. This means that `beforeExecute` can
 * be an appropriate place to make host changes as well, and `afterExecute` is typically used
 * for post verification.
 */
export class Resource {
  constructor (api) {
    this.state = api.state
    this._resourceApi = api.resource
  }

  resource (name) {
    return this._resourceApi(name)
  }

  prepAndValidateInstance () { }

  beforeExecute () { }

  afterExecute () { }

  executeInstance () { }
}

export function simpleResource (...args) {
  const executor = args.length === 1 ? args[0] : args[1]
  const name = args.length === 1 ? executor.name : args[0]
  // Cute hack to get an inferred name on the function
  const hack = {
    [name]: function (...args) {
      Resource.bind(this)(...args)
    }
  }
  const cls = hack[name]
  cls.prototype = Object.create(Resource.prototype)
  cls.prototype.executeInstance = function (...args) {
    executor(...args)
  }
  cls.prototype.constructor = cls
  return cls
}
