const { exec } = require('child_process')

const cmds = require('./cmds')
const { PORT, PROTOCOL } = require('./config')

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

async function getAccounts(quiet) {
  const { stderr } = await runCommand(cmds.accounts, quiet)
  return parseAccounts(stderr)
}

async function up(quiet = true) {
  await runCommand(cmds.up, quiet)

  // get predefined funded accounts
  const accounts = await getAccounts(quiet)
  
  // wait for some seconds for containers to properly setup before resolving
  // NB: fixes bug with failure to deploy contracts
  await sleep(10000)
  
  return Promise.resolve({
    node: {
      url: `http://localhost:${PORT}`,
      protocol: PROTOCOL
    },
    accounts
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

function parseAccounts(stream) {
  const seperatedAccountStream = stream.split(/\n/gi)
  const accounts = seperatedAccountStream.reduce((accumulator, account) => {
    if (account === '') return accumulator 
    const splits = account.split(',')
    accumulator.push({
      name: splits[0],
      publicKey: splits[1],
      address: splits[2],
      secretKey: splits[3].split(':')[1]
    })
    return accumulator
  }, [])
  return accounts
}

module.exports = {
  up,
  down
}