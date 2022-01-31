import dotenv from "dotenv"
import path from "path"

dotenv.config({
    path: path.join(__dirname, "../.env")
})

const tezosDomainsEnv = process.env.TEZOS_DOMAINS_ENV
if (!tezosDomainsEnv) {
    throw new Error("env should be set when testing")
}

export const env = JSON.parse(tezosDomainsEnv)

