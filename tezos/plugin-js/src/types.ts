export interface OperationStatus {
    hash: string
    type: string
    block: string
    time: string
    height: string
    cycle: number
    counter: number
    status: string
    is_success: boolean
    is_contract: boolean
    gas_limit: number
    gas_used: number
    gas_price: number
    storage_limit: number
    storage_size: number
    storage_paid: number
    volume: number
    fee: number
    days_destroyed: number
    sender: string
    receiver: string
    confirmations: number
  }