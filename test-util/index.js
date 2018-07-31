import * as opol from '../src'
import sinon from 'sinon'
import {File} from '../src/resources/file'
import {Resource} from '../src/resource'
import set from 'lodash.set'
import {Volume} from 'memfs'
import process from 'process'
import Promise from 'bluebird'

export function opolTest () {
  return new OpolTest()
}

class OpolTest {
  constructor () {
    this._overrideResources = []
    this._config = {
      stacks: []
    }
    this._useMocks = {
      file: true
    }
    this._api = {
      resourceSpys: {}
    }
  }

  /**
   * Specify (or override) the value of a property in the opol config object.
   *
   * Do not use this to specify stack, instead use the `.withStack` method.
   *
   * @param {String} path The property path into the Opol config
   * @param {any} value The value to use for the specified config property.
   */
  withConfig (path, value) {
    if (path === 'stacks') {
      throw new Error('Do not use this function to set the stacks, use .withStack instead')
    }
    set(this._config, path, value)
    return this
  }

  /**
   * Similar to `withMockResource`, this will automatically create a mock
   * `Resource` for you to serve as the named resource, and will provide
   * access to a spy of the mock through the `api`.
   *
   * The generated resource will implement the `Resource::prepAndValidateInstance`
   * with the exposed spy, so you can validate that it has been used by a stack
   * under test, for instance.
   *
   * @param {String} name The name of the resource to mock.
   * @param {Class<Resource>} Parent an optional parent class to use for mock resource
   */
  withResourceSpy (name, Parent = Resource) {
    const spy = sinon.spy()
    const hack = {
      [name]: function (...args) {
        Parent.bind(this)(...args)
      }
    }
    const mock = hack[name]
    mock.prototype = Object.create(Parent.prototype)
    mock.prototype.prepAndValidateInstance = spy
    mock.prototype.constructor = mock
    this._api.resourceSpys[name] = spy
    return this.withMockResource(name, mock)
  }

  /**
   * Use the given mock as the implementation of the specified resource,
   * overwriting any existing resource by that name.
   *
   * @param {Class<Resource>} resource A class that extends `Resource`, to
   * serve as the mock implementation of the named resource.
   */
  withMockResource (name, mock) {
    this._overrideResources.push({name, mock})
    return this
  }

  /**
   * Creates a test stack to be included in the test configuration, which
   * executes the given exerciser as it's converge function.
   */
  withExerciser (exerciser) {
    return this.withStack({
      name: `__test-exerciser-stack-${this._config.stacks.length}-${exerciser.name}__`,
      provideResources: () => {},
      converge: exerciser
    })
  }

  /**
   * Include the given stack in the test opol configuration. Stacks are eecuted in the order
   * they are added to the test.
   *
   * @param {String|Stack} spec The stack to include. Like an ordinary opol configuration, this
   * can either be the name of a stack module to include, or an object that implements the
   * `Stack Interface`.
   */
  withStack (spec) {
    this._config.stacks.push(spec)
    return this
  }

  /**
   * **Do not use** the stubbed `File` resource. By default, an implementation
   * of the `File` resource that uses an in-memory file system is included in
   * the test configuration. If you use this method, that resource will not be used.
   *
   * The `api` exposes the mock file system in two ways, if used. The `api.fs` handle
   * gives access to the `memfs` `Volume` that implements the mock filesystem, so you
   * can do things like read from the file system to see what the test stacks
   * created there. You can also use the `api.stubbedFileResource` property to access
   * the `writeFileStub` and `mkdirpStub` that the mock resource uses to modify
   * the in memory filesystem.
   */
  withoutStubbedFileResource () {
    this._useMocks.file = false
    return this
  }

  /**
   * Runs `opol.converge` with the established configuration, mocked resources,
   * stacks, and exerciser stacks. Returns a promise that fulfills from the converge,
   * but fulfills with this test's `api`.
   */
  testConverge () {
    if (this._useMocks.file) {
      const shadowFs = new Volume()
      shadowFs.mkdirpSync(process.cwd())
      const spy = sinon.spy()

      const writeFileStub = sinon.spy(Promise.promisify(shadowFs.writeFile.bind(shadowFs)))
      const mkdirpStub = sinon.spy(Promise.promisify(shadowFs.mkdirp.bind(shadowFs)))

      class StubbedFileResource extends File {
        constructor (api) {
          super(api, {writeFile: writeFileStub, mkdirp: mkdirpStub})
        }
        prepAndValidateInstance (...args) {
          spy(...args)
          super.prepAndValidateInstance(...args)
        }
      }
      this.withMockResource('File', StubbedFileResource)
      this._api.resourceSpys['File'] = spy
      this._api.stubbedFileResource = {writeFileStub, mkdirpStub}
      this._api.fs = {...shadowFs, readJsonSync: (...args) => JSON.parse(shadowFs.readFileSync(...args))}
    }

    return opol.converge(
      this._config,
      {
        provideResources: provide => {
          this._overrideResources.forEach(({name, mock}) => provide(name, mock))
        }
      }
    ).then(() => this._api)
  }
}
