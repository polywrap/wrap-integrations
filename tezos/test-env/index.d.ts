declare module '@web3api/tezos-test-env' {
    interface Node {
        url: string
        protocol: string
    }

    interface Account {
        name: string
        publicKey: string
        address: string
        secretKey: string
    }

    interface UpResponse {
        node: Node
        accounts: Account[]
    }

    function up(quiet?: boolean): Promise<UpResponse>
    function down(quiet?: boolean): Promise<void>
    function sleep(timeout: number): Promise<void>
}

