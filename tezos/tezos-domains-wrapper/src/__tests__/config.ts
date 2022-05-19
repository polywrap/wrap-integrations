import dotenv from "dotenv"

dotenv.config()

export const Config = {
  TZ_SECRET_KEY: process.env.TZ_SECRET_KEY || ""
}