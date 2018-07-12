
export function provideResources (provide) {

}

export function converge ({config, resource}) {
  resource('jsonFileResource')({
    path: 'package.json',
    contentBody: {
      name: config('project.name')
    }
  })
}
