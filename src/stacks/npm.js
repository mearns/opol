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

export function provideResources (provide) {
  provide('NpmPackageName', NpmPackageName)
  provide('NpmPackageVersion', NpmPackageVersion)
  provide('NpmPackageData', NpmPackageData)
}

export function converge ({state, config, resource}) {
  // Set default package data in stack state.
  resource('NpmPackageName')(config('project.name'))
  resource('NpmPackageVersion')(config('project.version'))

  const configGetter = () => {
    return (state.get('configMergeOperations') || []).reduce((config, {path, value}) => {
      set(config, path, value)
      return config
    }, {})
  }

  const jsonFile = resource('JsonFile')
  jsonFile({
    path: 'package.json',
    contentBody: configGetter
  })
}
