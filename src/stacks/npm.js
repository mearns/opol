import {Resource} from '../resource'
import set from 'lodash.set'

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
    if (deps[packageName] && deps[packageName] !== version) {
      throw new Error(`Cannot add dependency ${packageName}@${version}, another version is already specified: ${packageName}@${deps[packageName]}`)
    }
    deps[packageName] = version
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
}

export function converge ({state, config, resource}) {
  // Set default package data in stack state.
  resource('NpmPackageName')(config('project.name'))
  resource('NpmPackageVersion')(config('project.version'))

  state.set('allDependencies', {})

  const configGetter = () => {
    const initialConfig = {}
    const allDeps = state.get('allDependencies')
    if (allDeps) {
      const deps = allDeps.dependencies
      if (deps) {
        initialConfig.dependencies = deps
      }

      const devDeps = allDeps.devDependencies
      if (devDeps) {
        initialConfig.devDependencies = devDeps
      }
    }
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
