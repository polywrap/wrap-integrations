const CMDS = {
    up: `mkdir -p ./.local && docker-compose down --remove-orphans ; docker-compose run --rm --service-ports dev`,
    down: `docker-compose down`
}

module.exports = CMDS
