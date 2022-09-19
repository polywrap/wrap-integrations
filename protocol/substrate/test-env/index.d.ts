declare module 'substrate-polywrap-test-env' {
    interface Node {
        url: string
    }

    interface UpResponse {
        node: Node
    }

    function up(quiet?: boolean): Promise<UpResponse>
    function down(quiet?: boolean): Promise<void>
    function sleep(timeout: number): Promise<void>
}
