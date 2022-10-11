import { Result, ResultOk } from "@polywrap/result";
import { PolywrapClient } from "@polywrap/client-js";

import { Ipfs_Module } from "./types";
import createIpfsClient, { IpfsClient, IpfsFileInfo } from "@polywrap/ipfs-http-client-lite";
import { initInfra, ipfsProvider, stopInfra } from "./utils/infra";
import { getClientConfig } from "./utils/config";

jest.setTimeout(300000);

describe("IPFS Plugin", () => {
  let client: PolywrapClient;
  let ipfs: IpfsClient;

  const sampleFileTextContents = "Hello World!";
  let sampleFileIpfsInfo: IpfsFileInfo;
  const sampleFileBuffer = Uint8Array.from(Buffer.from(sampleFileTextContents, "utf-8"));

  beforeAll(async () => {
    await initInfra();
    ipfs = createIpfsClient(ipfsProvider);

    const config = getClientConfig(ipfsProvider);
    client = new PolywrapClient(config);

    let ipfsAddResult = await ipfs.add(sampleFileBuffer);
    sampleFileIpfsInfo = ipfsAddResult[0];
  });

  afterAll(async () => {
    await stopInfra();
  });

  it("Should cat a file successfully", async () => {
    expect(sampleFileIpfsInfo).toBeDefined();

    let result = await Ipfs_Module.cat(
      { cid: sampleFileIpfsInfo.hash.toString() },
      client,
    );
    
    if (!result.ok) fail(result.error);

    expect(result.value).toEqual(sampleFileBuffer);
  });

  it("Should resolve a file successfully", async () => {
    expect(sampleFileIpfsInfo).toBeDefined();

    let result = await Ipfs_Module.resolve(
      { cid: sampleFileIpfsInfo.hash.toString() },
      client,
    );

    if (!result.ok) fail(result.error);

    expect(result.value).toEqual({
      cid: `/ipfs/${sampleFileIpfsInfo.hash.toString()}`,
      provider: ipfsProvider,
    });
  });

  it("Should add a file successfully", async () => {
    const expectedContents = "A new sample file";
    const contentsBuffer = Buffer.from(expectedContents, "utf-8");

    let result = await Ipfs_Module.addFile({ data: contentsBuffer }, client);

    if (!result.ok) fail(result.error);

    expect(result.value).toBeTruthy();

    const addedFileBuffer = await ipfs.cat(result.value as string);

    expect(contentsBuffer).toEqual(addedFileBuffer);
  });

  it.only("Should timeout within a specified amount of time - env and options", async () => {
    const createRacePromise = (
      timeout: number
    ): Promise<Result<Uint8Array, Error>> => {
      return new Promise<Result<Uint8Array, Error>>((resolve) =>
        setTimeout(() => {
          resolve(
            ResultOk(Uint8Array.from([1, 2, 3, 4]))
          );
        }, timeout)
      );
    };

    const config = getClientConfig(ipfsProvider, 1000);
    const altClient = new PolywrapClient(config);

    const nonExistentFileCid = "Qmaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

    const catPromise = Ipfs_Module.cat({ cid: nonExistentFileCid }, altClient);

    let racePromise = createRacePromise(1500);

    let result = await Promise.race([catPromise, racePromise]);

    expect(result).toBeTruthy();
    result = result as { ok: false; error: Error | undefined };
    expect(result.error).toBeTruthy();
    expect(result.error?.stack).toMatch("IPFS method 'cat' failed");
    expect(result.error?.stack).toMatch(`Timeout of ${1000}ms exceeded`);

    const catPromiseWithTimeoutOverride = Ipfs_Module.cat(
      {
        cid: nonExistentFileCid,
        options: { timeout: 500 },
      },
      altClient,
    );

    racePromise = createRacePromise(1000);

    let resultForOverride = await Promise.race([
      catPromiseWithTimeoutOverride,
      racePromise,
    ]);

    expect(resultForOverride).toBeTruthy();
    resultForOverride = resultForOverride as { ok: false; error: Error | undefined };
    expect(resultForOverride.error).toBeTruthy();
    expect(result.error?.stack).toMatch("IPFS method 'cat' failed");
    expect(result.error?.stack).toMatch(`Timeout of ${500}ms exceeded`);
  });

  it("Should use provider from method options", async () => {
    const config = getClientConfig("this-provider-doesnt-exist");
    const clientWithBadProvider = new PolywrapClient(config);

    const catResult = await Ipfs_Module.cat(
      {
        cid: sampleFileIpfsInfo.hash.toString(),
        options: { provider: ipfsProvider },
      },
      clientWithBadProvider,
    );

    if (!catResult.ok) fail(catResult.error);
    expect(catResult.value).toEqual(sampleFileBuffer);

    const resolveResult = await Ipfs_Module.resolve(
      {
        cid: sampleFileIpfsInfo.hash.toString(),
        options: { provider: ipfsProvider },
      },
      clientWithBadProvider,
    );

    if (!resolveResult.ok) fail(resolveResult.error);
    expect(resolveResult.value).toEqual({
      cid: `/ipfs/${sampleFileIpfsInfo.hash.toString()}`,
      provider: ipfsProvider,
    });
  });

  it("Should use fallback provider from method options", async () => {
    const config = getClientConfig("this-provider-doesnt-exist");
    const clientWithBadProvider = new PolywrapClient(config);

    const catResult = await Ipfs_Module.cat(
      {
        cid: sampleFileIpfsInfo.hash.toString(),
        options: {
          provider: "this-provider-also-doesnt-exist",
          fallbackProviders: [ipfsProvider],
        },
      },
      clientWithBadProvider,
    );

    if (!catResult.ok) fail(catResult.error);
    expect(catResult.value).toEqual(sampleFileBuffer);

    const resolveResult = await Ipfs_Module.resolve(
      {
        cid: sampleFileIpfsInfo.hash.toString(),
        options: {
          provider: "this-provider-also-doesnt-exist",
          fallbackProviders: [ipfsProvider],
        },
      },
      clientWithBadProvider,
    );

    if (!resolveResult.ok) fail(resolveResult.error);
    expect(resolveResult.value).toEqual({
      cid: `/ipfs/${sampleFileIpfsInfo.hash.toString()}`,
      provider: ipfsProvider,
    });
  });
});
