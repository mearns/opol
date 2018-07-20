import {Resource} from '../resource'

class NpmPackageName extends Resource {
  prepAndValidateInstance (name) {
    this.state.set('name', name)
  }
}
class NpmPackageVersion extends Resource {
  prepAndValidateInstance (version) {
    this.state.set('version', version)
  }
}

export function provideResources (provide) {
  provide('NpmPackageName', NpmPackageName)
  provide('NpmPackageVersion', NpmPackageVersion)
}

export function converge ({state, config, resource}) {
  // Set default package data in stack state.
  resource('NpmPackageName')(config('project.name'))
  resource('NpmPackageVersion')(config('project.version'))

  const jsonFile = resource('JsonFile')
  jsonFile({
    path: 'package.json',
    contentBody: () => ({
      name: state.get('name'),
      version: state.get('version')
    })
  })
}
