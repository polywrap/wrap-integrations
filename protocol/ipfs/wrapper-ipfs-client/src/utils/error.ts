import { Box } from "@polywrap/wasm-as";

export function ipfsError(method: string, message: string | null = null, status: Box<i32> | null = null, statusText: string | null = null): string {
  if (message !== null && message.startsWith("Error: ")) {
    message = message.substring(7);
    message = message.charAt(0).toUpperCase() + message.substring(1);
  }
  return `IPFS method '${method}' failed. ${message === null ? "" : message}` +
    `${status === null ? "" : "\nStatus code: " + status.unwrap().toString()}`+
    `${statusText === null ? "" : "\nStatus: " + statusText}`
}
