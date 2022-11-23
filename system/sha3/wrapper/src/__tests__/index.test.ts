import { PolywrapClient } from "@polywrap/client-js"
import {
  sha3_512,
  sha3_384,
  sha3_256,
  sha3_224,
  keccak_512,
  keccak_384,
  keccak_256,
  keccak_224,
  shake_128,
  shake_256,
} from "js-sha3";
import path from "path";

const testMessage = "test message to hash"

describe("js-sha3 algorithms returned values match the wrapper's", () => {
  let client: PolywrapClient = new PolywrapClient();
  let fsUri: string;

  beforeAll(() => {
    const dirname: string = path.resolve(__dirname);
    const wrapperPath: string = path.join(dirname, "..", "..");
    fsUri = `fs/${wrapperPath}/build`;
  });
  
  it("sha3_512 matches", async () => {
    const expected = sha3_512(testMessage);
    const response = await client.invoke<string>({
      uri: fsUri,
      method: "sha3_512",
      args: {
        message: testMessage
      },
    });

    if (response.ok == false) fail(response.error);
    expect(response.value).toBe(expected);
  });
  
  it("sha3_384 matches", async () => {
    const expected = sha3_384(testMessage);
    const response = await client.invoke<string>({
      uri: fsUri,
      method: "sha3_384",
      args: {
        message: testMessage
      },
    });

    if (response.ok == false) fail(response.error);
    expect(response.value).toBe(expected);
  });

  it("sha3_256 matches", async () => {
    const expected = sha3_256(testMessage);
    const response = await client.invoke<string>({
      uri: fsUri,
      method: "sha3_256",
      args: {
        message: testMessage
      },
    });

    if (response.ok == false) fail(response.error);
    expect(response.value).toBe(expected);
  });

  it("sha3_224 matches", async () => {
    const expected = sha3_224(testMessage);
    const response = await client.invoke<string>({
      uri: fsUri,
      method: "sha3_224",
      args: {
        message: testMessage
      },
    });

    if (response.ok == false) fail(response.error);
    expect(response.value).toBe(expected);
  });

  it("keccak_512 matches", async () => {
    const expected = keccak_512(testMessage);
    const response = await client.invoke<string>({
      uri: fsUri,
      method: "keccak_512",
      args: {
        message: testMessage
      },
    });

    if (response.ok == false) fail(response.error);
    expect(response.value).toBe(expected);
  });

  it("keccak_384 matches", async () => {
    const expected = keccak_384(testMessage);
    const response = await client.invoke<string>({
      uri: fsUri,
      method: "keccak_384",
      args: {
        message: testMessage
      },
    });

    if (response.ok == false) fail(response.error);
    expect(response.value).toBe(expected);
  });

  it("keccak_256 matches", async () => {
    const expected = keccak_256(testMessage);
    const response = await client.invoke<string>({
      uri: fsUri,
      method: "keccak_256",
      args: {
        message: testMessage
      },
    });

    if (response.ok == false) fail(response.error);
    expect(response.value).toBe(expected);
  });

  it("keccak_224 matches", async () => {
    const expected = keccak_224(testMessage);
    const response = await client.invoke<string>({
      uri: fsUri,
      method: "keccak_224",
      args: {
        message: testMessage
      },
    });

    if (response.ok == false) fail(response.error);
    expect(response.value).toBe(expected);
  });

  it("keccak_256 hex matches", async () => {
    const hexMessage = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

    // remove the leading 0x
    const hexString = hexMessage.replace(/^0x/, "");

    // ensure even number of characters
    if (hexString.length % 2 != 0) {
      throw Error(
        `expecting an even number of characters in the hexString: ${hexString.length}`
      );
    }

    // check for some non-hex characters
    const bad = hexString.match(/[G-Z\s]/i);
    if (bad) {
      throw Error(`found non-hex characters: ${bad}`);
    }

    // split the string into pairs of octets
    const pairs = hexString.match(/[\dA-F]{2}/gi);

    if (!pairs) {
      throw Error("Invalid hexString, unable to split into octets");
    }

    // convert the octets to integers
    const integers = pairs.map((p) => {
      return parseInt(p, 16);
    });

    const expected = keccak_256(new Uint8Array(integers));
    const response = await client.invoke<Uint8Array>({
      uri: fsUri,
      method: "hex_keccak_256",
      args: {
        message: hexMessage
      },
    });

    if (response.ok == false) fail(response.error);
    expect(response.value).toBe(expected);
  });

  it("keccak_256 buffer matches", async () => {
    const encoder = new TextEncoder();
    const testMessageBuffer = encoder.encode(testMessage);
    const expected = keccak_256(testMessageBuffer)
    const response = await client.invoke<Uint8Array>({
      uri: fsUri,
      method: "buffer_keccak_256",
      args: {
        message: testMessageBuffer
      },
    });

    if (response.ok == false) fail(response.error);
    expect(response.value).toBe(expected);
  });

  it("shake_256 matches", async () => {
    const expected = shake_256(testMessage, 512);
    const response = await client.invoke<string>({
      uri: fsUri,
      method: "shake_256",
      args: {
        message: testMessage,
        outputBits: 512
      },
    });

    if (response.ok == false) fail(response.error);
    expect(response.value).toBe(expected);
  });

  it("shake_128 matches", async () => {
    const expected = shake_128(testMessage, 256);
    const response = await client.invoke<string>({
      uri: fsUri,
      method: "shake_128",
      args: {
        message: testMessage,
        outputBits: 256
      },
    });

    if (response.ok == false) fail(response.error);
    expect(response.value).toBe(expected);
  });
});