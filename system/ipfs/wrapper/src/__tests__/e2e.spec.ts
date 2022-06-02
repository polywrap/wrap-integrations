import { Web3ApiClient } from "@web3api/client-js";
// import { filesystemPlugin } from "@web3api/fs-plugin-js";

jest.setTimeout(300000);

describe("IPFS Wrapper", () => {
  const client = new Web3ApiClient()
  const cid = "QmTPSFGfzX5YpNBHkvzLRXqQxurLoZXZCymUX56n4q9dwK/web3api.yaml"
  // beforeAll(async () => {})

  it("Should fetch file as blob from ipfs", async () => {
    const response = await client.invoke({
      uri: 'fs/./build',
      module: "query",
      method: "catFile",
      input: {
       cid,
       options: {
         provider: "http://localhost:5001"
       } 
      }
    })
    console.log({ response })
  });

  it("Should fetch file as string from ipfs", async () => {
    const response = await client.invoke({
      uri: 'fs/./build',
      module: "query",
      method: "catFileToString",
      input: {
       cid,
       options: {
         provider: "http://localhost:5001"
       } 
      }
    })
    console.log({ response })
  });

  it("Should resolve cid of file from ipfs", async () => {
    const response = await client.invoke({
      uri: 'fs/./build',
      module: "query",
      method: "resolve",
      input: {
       cid,
       options: {
         provider: "http://localhost:5001"
       } 
      }
    })
    console.log({ response })
  });
 
});
