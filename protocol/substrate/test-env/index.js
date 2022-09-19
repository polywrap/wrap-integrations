const { exec } = require('child_process')

const cmds = require('./cmds')
const { PORT } = require('./config')

async function runCommand(command, quiet) {
  if (!quiet) {
    console.log(`> ${command}`)
  }

  return new Promise((resolve, reject) => {
    const callback = (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        if (!quiet) {
          // the *entire* stdout and stderr (buffered)
          console.log(`stdout: ${stdout}`)
          console.log(`stderr: ${stderr}`)
        }

        resolve({stdout, stderr})
      }
    }

    exec(command, { cwd: __dirname }, callback)
  })
}

async function up(quiet = true) {
  await runCommand(cmds.up, quiet)
  
  // wait for some seconds for containers to properly setup before resolving
  // NB: fixes bug with failure to deploy contracts
  await sleep(60000)
  
  return Promise.resolve({
    node: {
      url: `http://localhost:${PORT}`
    }
  })
}

async function sleep(timeout = 5000) {
   await new Promise((resolve) => setTimeout(() => resolve(), timeout))
}

async function down(quiet = true) {
  await runCommand(cmds.down, quiet)
  // Sleep for a few seconds to make sure all services are torn down
  await sleep()
}

module.exports = {
  up,
  down,
  sleep,
}
