
export function provideResources (provide) {

}

export function converge ({config, resource}) {
  const jsonFile = resource('JsonFile')
  resource('config')({name: 'project.name', version: 'project.version'}, ({name, version}) => {
    jsonFile({
      path: 'package.json',
      contentBody: {
        name,
        version
      }
    })
  })
}
