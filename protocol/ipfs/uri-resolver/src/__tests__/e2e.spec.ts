import { PolywrapClient } from "@polywrap/client-js";

import { Result } from "@polywrap/core-js";
import { ResultOk } from "@polywrap/result";
import { getClientConfig } from "./utils/config";
import { buildWrapperWithImage, deployWrapper, initInfra, ipfsProvider, stopInfra } from "./utils/infra";
import path from "path";
import fs from "fs";

jest.setTimeout(300000);

const createRacePromise = (
  timeout: number
): Promise<Result<Uint8Array, Error>> => {
  return new Promise<Result<Uint8Array, Error>>((resolve) =>
    setTimeout(() => {
      resolve(ResultOk(Uint8Array.from([1, 2, 3, 4])));
    }, timeout)
  );
};

describe("IPFS Plugin", () => {
  let ipfsResolverUri: string = "wrap://ens/ipfs-resolver.polywrap.eth";
  let wrapperIpfsUri: string;

  beforeAll(async () => {
    await initInfra();

    // build simple wrapper test case
    const wrapperPath = path.resolve(__dirname, "simple-wrapper");
    await buildWrapperWithImage(wrapperPath);

    // deploy simple wrapper test case and read cid
    const deployOutputPath = path.join(wrapperPath, "ipfs.json");
    await deployWrapper(wrapperPath, deployOutputPath);
    const deployOutputStr: string = fs.readFileSync(deployOutputPath, "utf-8");
    wrapperIpfsUri = JSON.parse(deployOutputStr)[0].steps[0].result.trim();
  });

  afterAll(async () => {
    await stopInfra();
  });

  it("Should successfully resolve a deployed wrapper - e2e", async () => {
    const config = getClientConfig(ipfsProvider);
    const client = new PolywrapClient(config, { noDefaults: true });

    const result = await client.tryResolveUri({ uri: wrapperIpfsUri });

    if (!result.ok) {
      fail(result.error);
    }

    if (result.value.type !== "wrapper") {
      fail("Expected response to be a wrapper");
    }

    const manifest = result.value.wrapper.getManifest();

    expect(manifest?.name).toBe("Simple");
  });

  it("Should properly timeout - getFile", async () => {
    const timeout = 1000;
    const config = getClientConfig(ipfsProvider, timeout);
    const client = new PolywrapClient(config, { noDefaults: true });

    const nonExistentFileCid = "Qmaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

    const getFilePromise = client.invoke<Uint8Array>({
      uri: ipfsResolverUri,
      method: "getFile",
      args: {
        path: nonExistentFileCid,
      },
    });

    const fasterRacePromise = createRacePromise(timeout - 100);
    const slowerRacePromise = createRacePromise(timeout + 200);

    const fasterRaceResult = await Promise.race([
      fasterRacePromise,
      getFilePromise,
    ]);
    const slowerRaceResult = await Promise.race([
      getFilePromise,
      slowerRacePromise,
    ]);

    if (!fasterRaceResult.ok) fail(fasterRaceResult.error);
    const expectedFasterResult = await fasterRacePromise;
    if (!expectedFasterResult.ok) fail(expectedFasterResult.error)
    expect(fasterRaceResult.value).toStrictEqual(expectedFasterResult.value);

    if (!slowerRaceResult.ok) fail(slowerRaceResult.error);
    const expectedSlowerResult = await getFilePromise;
    if (!expectedSlowerResult.ok) fail(expectedSlowerResult.error);
    expect(slowerRaceResult.value).toStrictEqual(expectedSlowerResult.value);
  });

  it("Should properly timeout - tryResolveUri", async () => {
    const timeout = 1000;
    const config = getClientConfig(ipfsProvider, timeout);
    const client = new PolywrapClient(config, { noDefaults: true });

    const nonExistentFileCid = "Qmaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

    const getFilePromise = client.invoke<Uint8Array>({
      uri: ipfsResolverUri,
      method: "tryResolveUri",
      args: {
        authority: "ipfs",
        path: nonExistentFileCid,
      },
    });

    const fasterRacePromise = createRacePromise(timeout - 100);
    const slowerRacePromise = createRacePromise(timeout + 200);

    const fasterRaceResult = await Promise.race([
      fasterRacePromise,
      getFilePromise,
    ]);
    const slowerRaceResult = await Promise.race([
      getFilePromise,
      slowerRacePromise,
    ]);

    if (!fasterRaceResult.ok) fail(fasterRaceResult.error);
    const expectedFasterResult = await fasterRacePromise;
    if (!expectedFasterResult.ok) fail(expectedFasterResult.error)
    expect(fasterRaceResult.value).toStrictEqual(expectedFasterResult.value);

    if (!slowerRaceResult.ok) fail(slowerRaceResult.error);
    const expectedSlowerResult = await getFilePromise;
    if (!expectedSlowerResult.ok) fail(expectedSlowerResult.error);
    expect(slowerRaceResult.value).toStrictEqual(expectedSlowerResult.value);
  });
});
