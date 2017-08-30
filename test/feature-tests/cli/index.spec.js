/* eslint-env mocha */

import childProcess from 'child_process'
import Promise from 'bluebird'
import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)

function runOpolCommand (args = '') {
  return new Promise((resolve, reject) => {
    childProcess.exec(`node ./dist/src/main.js ${args}`, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      }
      resolve({stdout, stderr})
    })
  })
}

describe('The opol cli', () => {
  it('should exit with a code of 0', () => {
    return expect(runOpolCommand()).to.be.fulfilled
  })
})
