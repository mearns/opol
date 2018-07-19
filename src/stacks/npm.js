// import {Resource} from '../resource'

// XXX: Was just about to use the new shared state to implement this and the rest, when Melissa made me go to bed.
// class NpmDependency extends Resource {
//   prepAndValidateInstance (command, ...args) {
//   }
// }

export function provideResources (provide) {

}

export function converge ({state, config, resource}) {
  // Set default package data in stack state.
  state.set('name', config('project.name'))
  state.set('version', config('project.version'))

  const jsonFile = resource('JsonFile')
  jsonFile({
    path: 'package.json',
    contentBody: () => ({
      name: state.get('name'),
      version: state.get('version')
    })
  })
}
