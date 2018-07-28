import {Resource} from '../resource'
import set from 'lodash.set'
import * as semver from '../util/semver-util'

class NpmScript extends Resource {
  prepAndValidateInstance (name, script) {
    const scripts = this.state.get('scripts') || {}
    if (scripts[name] && scripts[name] !== script) {
      throw new Error(`Conflicting script specified for ${name}`)
    }
    scripts[name] = script
    this.state.set('scripts', scripts)
  }
}

class NpmPackageName extends Resource {
  prepAndValidateInstance (name) {
    this.resource('NpmPackageData')('name', name)
  }
}

class NpmPackageVersion extends Resource {
  prepAndValidateInstance (version) {
    this.resource('NpmPackageData')('version', version)
  }
}

class NpmPackageData extends Resource {
  prepAndValidateInstance (path, value) {
    const mergeOps = [...(this.state.get('configMergeOperations') || []), {path, value}]
    this.state.set('configMergeOperations', mergeOps)
  }
}

class NpmAnyDependency extends Resource {
  prepAndValidateInstance (packageName, {version, type = 'dependencies'} = {}) {
    const allDepedencies = this.state.get('allDependencies') || {}
    const deps = allDepedencies[type] = allDepedencies[type] || {}
    deps[packageName] = [...(deps[packageName] || []), version]
    this.state.set('allDependencies', allDepedencies)
  }
}

class NpmDependency extends Resource {
  prepAndValidateInstance (packageName, version) {
    this.resource('NpmAnyDependency')(packageName, {version, type: 'dependencies'})
  }
}
class NpmDevDependency extends Resource {
  prepAndValidateInstance (packageName, version) {
    this.resource('NpmAnyDependency')(packageName, {version, type: 'devDependencies'})
  }
}

export function provideResources (provide) {
  provide('NpmPackageName', NpmPackageName)
  provide('NpmPackageVersion', NpmPackageVersion)
  provide('NpmPackageData', NpmPackageData)
  provide('NpmAnyDependency', NpmAnyDependency)
  provide('NpmDependency', NpmDependency)
  provide('NpmDevDependency', NpmDevDependency)
  provide('NpmScript', NpmScript)
}

function generateScripts (state) {
  return state.get('scripts') || null
}

function addScripts (packageData, state) {
  const scripts = generateScripts(state)
  if (scripts) {
    packageData.scripts = scripts
  }
}

function generateDepedencies (type, state) {
  const deps = (state.get('allDependencies') || {})[type]
  if (!deps) {
    return null
  }
  return Object.keys(deps).reduce((packageDeps, packageName) => {
    try {
      const range = semver.intersection(...(deps[packageName]))
      packageDeps[packageName] = range.simplify().toString()
    } catch (e) {
      if (e instanceof semver.EmptyIntersectionError) {
        throw new Error(`Conflicting version constraints for package ${packageName}: ${deps[packageName].join(', ')}`)
      }
    }
    return packageDeps
  }, {})
}

function addPackageDependencies (packageData, type, state) {
  const deps = generateDepedencies(type, state)
  if (deps) {
    packageData[type] = deps
  }
}

export function converge ({state, config, resource}) {
  // Set default package data in stack state.
  resource('NpmPackageName')(config('project.name'))
  resource('NpmPackageVersion')(config('project.version'))

  state.set('allDependencies', {})

  const configGetter = () => {
    const initialConfig = {}

    addPackageDependencies(initialConfig, 'dependencies', state)
    addPackageDependencies(initialConfig, 'devDependencies', state)
    addScripts(initialConfig, state)

    return (state.get('configMergeOperations') || []).reduce((config, {path, value}) => {
      const addOn = {}
      set(addOn, path, value)
      return {...config, ...addOn}
    }, initialConfig)
  }

  const jsonFile = resource('JsonFile')
  jsonFile({
    path: 'package.json',
    contentBody: configGetter
  })
}
