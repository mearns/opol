import {Resource} from '../resource'
import Promise from 'bluebird'
import ChildProcess from 'child_process'

/**
 * @callback spawn
 *
 * A function that spawns a subprocess and returns a {@link ChildProcess} that represents it.
 *
 * @param {string} command
 * @param {string[]} [arguments]
 * @param {ChildProcessOptions} [options]
 * @returns {ChildProcess}
 */

/**
 * @callback spawnUser
 *
 * A function that takes the {@link spawn} function and other arguments to spawn the process for the
 * command resource usage. It should return a {@link ChildProcess} object representing the spawned
 * process.
 *
 * @param {spawn} spawn
 * @param {string} command The command to run
 * @param {string[]} args The command arguments
 * @param {SpawnOptions} opts
 * @returns {ChildProcess}
 */

/**
 * @callback processUser
 *
 * A function that takes the {@link ChildProcess} object, e.g., one created by a {@link spawnUser}.
 * It returns a promise that fulfills with a {@link ProcessResult}, or rejects with a {@link ProcessError}.
 *
 * @param {ChildProcess} process The handle on the process.
 * @param {string} command The command that was run
 * @param {string[]} args The command arguments
 * @param {SpawnOptions} opts
 * @returns {Promise<ProcessResult,ProcessError>}
 */

/**
 * @typedef {Object} ProcessResult
 * @property {int} code The exit code from the process
 * @property {?string} [stdout] The STDOUT from the process, if it was buffered.
 * @property {?string} [stderr] The STDERR from the process, if it was buffered.
 */

 /**
  * @typedef {Error} ProcessError
  * @property {?int} [code] The exist code from the process if it ran.
  * @property {?string} [stdout] The STDOUT from the process, if the process ran and the output was buffered.
  * @property {?string} [stderr] The STDERR from the process, if the process ran and the output was buffered.
  */

function standardSpawn (spawn, command, args, {buffer}) {
  const spawnOpts = {}
  if (buffer) {
    spawnOpts.stdio = ['ignore', 'pipe', 'pipe']
  } else {
    spawnOpts.stdio = ['ignore', 'ignore', 'ignore']
  }
  return spawn(command, args, spawnOpts)
}

function standardProcess (process, command, args, {buffer}) {
  let stdout, stderr
  if (buffer) {
    stdout = ''
    stderr = ''
    process.stdout.on('data', data => {
      stdout += data
    })
    process.stderr.on('data', data => {
      stderr += data
    })
  }

  return new Promise((resolve, reject) => {
    process.on('error', cause => {
      const error = new Error(`Error running command "${command}": ${cause.message}`)
      error.cause = cause
      reject(error)
    })
    process.on('close', exitCode => {
      if (exitCode === 0) {
        resolve({code: exitCode, stdout, stderr})
      } else {
        const error = new Error(`Command "${command}" exited with non-zero exit code ${exitCode}`)
        error.code = exitCode
        error.stdout = stdout
        error.stderr = stderr
        reject(error)
      }
    })
  })
}

/**
 * @typedef {Object} CommandOptions
 * @property {spawnUser} [usingSpawn] A function that receives the {@link spawn} function and other
 * arguments and should return a {@link ChildProcess} (or comparable object) for the command.
 *
 * @property {processUser} [usingProcess] A function that receives the {@link ChildProcess} object
 * created by {@link #usingSpawn} and returns a Promise that settles based on the command completing.
 *
 * @property {SpawnOptions} [...]
 */

/**
 * @typedef {Object} SpawnOptions
 * @property {boolean} [buffer=true] If true, indicates that the `processUser` should collect the
 * STDOUT and STDERR output from the command into strings and fulfill with those as the values of
 * the stdout and stderr properties, respecitvely. Otherwise, it can safely ignore the output.
 */

/**
 * @function Command
 *
 * The `Command` resource is used to execute arbitary commands on the system.
 *
 * @param {string[]} commandArgs The command to run and it's arguments, as an array. The first
 * element in the array is the command, the remaining are the arguments.
 *
 * @param {CommandOptions} [opts] Optional options for the resource.
 */
export class Command extends Resource {
  executeInstance (commandArgs, {usingSpawn = standardSpawn, usingProcess = standardProcess, buffer = true}) {
    const [command, ...args] = commandArgs
    const opts = {buffer}
    const process = usingSpawn(ChildProcess.spawn, command, args, opts)
    return Promise.method(usingProcess)(process, opts)
  }
}
