import * as Types from "./w3"
import { DomainInfo } from "@tezos-domains/core"

export const toDomainRecords = (record: DomainInfo): Types.DomainRecords => ({
    address: record.address,
    data: JSON.stringify(record.data.raw()),
    name: record.name,
    expiry: record.expiry?.toUTCString()
})