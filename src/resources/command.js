import {Resource} from '../resource'
import Promise from 'bluebird'
import childProcess from 'child_process'
require('babel-polyfill')

/**
 * Indicates that a child process failed.
 * @property {?int} [code] The exist code from the process
 */
class ProcessError extends Error {
  constructor (...args) {
    super(...args)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Indicates a failure attempting to execute a command. This means the command never
 * even got executed. If it had been executed and failed in execution, you would
 * get a {@link ProcessError}.
 */
class CommandExecutionError extends Error {
  constructor (...args) {
    super(...args)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * @function Command
 *
 * The `Command` resource is used to execute arbitary commands on the system.
 *
 * @param {string[]} commandArgs The command to run and it's arguments, as an array. The first
 * element in the array is the command, the remaining are the arguments.
 *
 * @param {ChildProcessOptions} [childProcessOptions] An optional object of options to pass to
 * {@link ChildProcess.spawn}.
 *
 * @returns {Promise<undefined, CommandExecutionError|ProcessError>} the execute phase
 * returns a promise that settles based on the results of the process execution.
 */
export class Command extends Resource {
  constructor (api, {spawn = childProcess.spawn}) {
    super(api)
    this.spawn = spawn
  }

  executeInstance (commandArgs, childProcessOptions) {
    const [command, ...args] = commandArgs
    const process = this.spawn(command, args, childProcessOptions)

    return new Promise((resolve, reject) => {
      process.on('error', cause => {
        const error = new CommandExecutionError(`Error running command "${command}": ${cause.message}`)
        error.cause = cause
        reject(error)
      })
      process.on('close', exitCode => {
        if (exitCode === 0) {
          resolve()
        } else {
          const error = new ProcessError(`Command "${command}" exited with non-zero exit code ${exitCode}`)
          error.code = exitCode
          reject(error)
        }
      })
    })
  }
}
