#!/bin/sh

# declare enviroment variables with default values
BLOCK_TIME=${TEZOS_POLYWRAP_BLOCK_TIME:-5}
PROTOCOL="${TEZOS_POLYWRAP_PROTOCOL:-Hangzhou}"
ROOT_PATH="${TEZOS_POLYWRAP_ROOT_PATH:-/tmp/mini-net}"

export toby="$(flextesa key toby)"
export suwe="$(flextesa key suwe)"

# flextesa startup script 
startup() {
    echo "starting tezos node with protocol ${PROTOCOL} ...."
    flextesa mini-net \
        --root "$ROOT_PATH" --size 1 "$@" \
        --set-history-mode N000:archive \
        --number-of-b 1 \
        --balance-of-bootstrap-accounts tez:100_000_000 \
        --time-b "$BLOCK_TIME" \
        --add-bootstrap-account="$toby@2_000_000_000_000" \
        --add-bootstrap-account="$suwe@2_000_000_000_000" \
        --no-daemons-for=toby \
        --no-daemons-for=suwe \
        --until-level 200_000_000 \
        --protocol-kind "$PROTOCOL"
}

# get bootstrapped accounts
accounts() {
    cat >&2 <<EOF
$(echo $toby)
$(echo $suwe)
EOF
}

"$@"