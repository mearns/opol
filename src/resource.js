
export class Resource {
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
  cls.prototype = Object.create(Resource.prototype, {
    executeInstance: function (...args) {
      executor(...args)
    }
  })
  cls.prototype.constructor = cls
  return cls
}
