const CMDS = {
    up: `mkdir -p ./.local && docker-compose up --detach`,
    down: `docker-compose down`
}

module.exports = CMDS
