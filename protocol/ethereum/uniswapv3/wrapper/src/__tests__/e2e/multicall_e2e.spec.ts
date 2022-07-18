import { PolywrapClient } from "@polywrap/client-js";
import {buildWrapper,} from "@polywrap/test-env-js";
import path from "path";
import { encodeMulticall, getPlugins, initInfra, stopInfra } from "./helpers";

jest.setTimeout(120000);

describe('Multicall (SDK test replication)', () => {

  let client: PolywrapClient;
  let fsUri: string;

  beforeAll(async () => {
     await initInfra();
    // get client
    const config = getPlugins();
    client = new PolywrapClient(config);
    // deploy api
    const wrapperAbsPath: string = path.resolve(__dirname + "/../../../");
    await buildWrapper(wrapperAbsPath);
    fsUri = "fs/" + wrapperAbsPath + '/build';
  });

  afterAll(async () => {
    await stopInfra();
  });

  describe('encodeMulticall', () => {
    it('works for string array with length 1', async () => {
      const calldata = await encodeMulticall(client, fsUri, ['0x01']);
      expect(calldata).toBe('0x01');
    });

    it('works for string array with length >1', async () => {
      const calldata = await encodeMulticall(client, fsUri, [
        '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
      ]);
      expect(calldata).toBe(
        '0xac9650d800000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000020aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0000000000000000000000000000000000000000000000000000000000000020bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
      );
    });
  });
});
