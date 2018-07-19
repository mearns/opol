
export class Resource {
  prepAndValidateInstance () { }

  beforeExecute () { }

  afterExecute () { }

  executeInstance () { }
}

class Config extends Resource {
  prepAndValidateInstance (pathSpec, func) {
    const args = []
    if (typeof pathSpec === 'string') {
      args.push(get(this._config, pathSpec))
    } else if (Array.isArray(pathSpec)) {
      args.push(pathSpec.map(spec => get(this._config, spec)))
    } else {
      args.push(Object.keys(pathSpec).reduce((_args, key) => {
        _args[key] = get(this._config, pathSpec[key])
      }, {}))
    }
    func(...args)
  }
}

export function createConfigResource (config) {

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
