require("dotenv").config({ path: `${__dirname}/.env` });

const Config = {
  PORT: process.env.SUBSTRATE_POLYWRAP_PORT || 9933,
}

module.exports = Config
