const { TezosToolkit, InMemorySigner } = require('@taquito/taquito')

const { PORT } = require('./config')

function getClient() {
    const Tezos = new TezosToolkit(`http://localhost:${PORT}`)
    return Tezos
}

function getSigner(secretKey) {
    return await InMemorySigner.fromSecretKey(secretKey)

}

module.exports = {
    getClient,
    getSigner
}