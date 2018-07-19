
export function provideResources (provide) {

}

export function converge ({config, resource}) {
  const jsonFile = resource('JsonFile')
  jsonFile({
    path: 'package.json',
    contentBody: {
      name: config('project.name'),
      version: config('project.version')
    }
  })
}
