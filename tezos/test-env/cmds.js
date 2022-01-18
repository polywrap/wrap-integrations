const CMDS = {
    up: `docker-compose up --detach`,
    down: `docker-compose down`,
    accounts: `docker container exec TEZOS_POLYWRAP_SANDBOX "/bin/sh" init.sh accounts`
}

module.exports = CMDS