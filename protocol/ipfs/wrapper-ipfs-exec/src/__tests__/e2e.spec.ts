import { Result, ResultOk } from "@polywrap/result";
import { PolywrapClient } from "@polywrap/client-js";
import { concurrentPromisePlugin } from "@polywrap/concurrent-promise-plugin";

import { Ipfs_Module } from "./types";
import createIpfsClient, { IpfsClient, IpfsFileInfo } from "@polywrap/ipfs-http-client-lite";
import { initInfra, ipfsProvider, stopInfra } from "./utils/infra";
import path from "path";

jest.setTimeout(300000);

describe("IPFS Plugin", () => {
  let client: PolywrapClient;
  let ipfs: IpfsClient;
  let fsUri: string;

  const sampleFileTextContents = "Hello World!";
  let sampleFileIpfsInfo: IpfsFileInfo;
  const sampleFileBuffer = Buffer.from(sampleFileTextContents, "utf-8");

  beforeAll(async () => {
    await initInfra();
    ipfs = createIpfsClient(ipfsProvider);

    const ipfsExecPath = path.resolve(path.join(__dirname, "/../../build"));
    fsUri = `wrap://fs/${ipfsExecPath}`;

    const ipfsClientPath = path.resolve(path.join(__dirname, "/../../../wrapper-ipfs-client/build"));
    const clientFsUri = `wrap://fs/${ipfsClientPath}`;
    
    client = new PolywrapClient({
      envs: [
        {
          uri: fsUri,
          env: {
            provider: ipfsProvider,
          },
        },
      ],
      redirects: [
        {
          from: "ens/ipfs-client.polywrap.eth",
          to: clientFsUri,
        }
      ],
      plugins: [
        {
          uri: "ens/concurrent.polywrap.eth",
          plugin: concurrentPromisePlugin({})
        }
      ],
      interfaces: [
        {
          interface: "ens/interface.concurrent.polywrap.eth",
          implementations: ["ens/concurrent.polywrap.eth"]
        }
      ]
    });

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
      fsUri
    );
    
    if (!result.ok) fail(result.error);

    expect(result.value).toEqual(sampleFileBuffer);
  });

  it("Should resolve a file successfully", async () => {
    expect(sampleFileIpfsInfo).toBeDefined();

    let result = await Ipfs_Module.resolve(
      { cid: sampleFileIpfsInfo.hash.toString() },
      client,
      fsUri
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

    let result = await Ipfs_Module.addFile({ data: contentsBuffer }, client, fsUri);

    if (!result.ok) fail(result.error);

    expect(result.value).toBeTruthy();

    const addedFileBuffer = await ipfs.cat(result.value as string);

    expect(contentsBuffer).toEqual(addedFileBuffer);
  });

  it("Should timeout within a specified amount of time - env and options", async () => {
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

    const altClient = new PolywrapClient({
      envs: [
        {
          uri: fsUri,
          env: {
            provider: ipfsProvider,
            timeout: 1000,
          },
        },
      ],
    });

    const nonExistentFileCid = "Qmaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

    const catPromise = Ipfs_Module.cat({ cid: nonExistentFileCid }, altClient, fsUri);

    let racePromise = createRacePromise(1100);

    let result = await Promise.race([catPromise, racePromise]);

    expect(result).toBeTruthy();
    result = result as { ok: false; error: Error | undefined };
    expect(result.error).toBeTruthy();
    expect(result.error?.stack).toMatch("Timeout has been reached");
    expect(result.error?.stack).toMatch("Timeout: 1000");

    const catPromiseWithTimeoutOverride = Ipfs_Module.cat(
      {
        cid: nonExistentFileCid,
        options: { timeout: 500 },
      },
      altClient,
      fsUri
    );

    racePromise = createRacePromise(600);

    let resultForOverride = await Promise.race([
      catPromiseWithTimeoutOverride,
      racePromise,
    ]);

    expect(resultForOverride).toBeTruthy();
    resultForOverride = resultForOverride as { ok: false; error: Error | undefined };
    expect(resultForOverride.error).toBeTruthy();
    expect(resultForOverride.error?.stack).toMatch("Timeout has been reached");
    expect(resultForOverride.error?.stack).toMatch("Timeout: 500");
  });

  it("Should use provider from method options", async () => {
    const clientWithBadProvider = new PolywrapClient({
      envs: [
        {
          uri: fsUri,
          env: {
            provider: "this-provider-doesnt-exist",
          },
        },
      ],
    });

    const catResult = await Ipfs_Module.cat(
      {
        cid: sampleFileIpfsInfo.hash.toString(),
        options: { provider: ipfsProvider },
      },
      clientWithBadProvider,
      fsUri
    );

    if (!catResult.ok) fail(catResult.error);
    expect(catResult.value).toEqual(sampleFileBuffer);

    const resolveResult = await Ipfs_Module.resolve(
      {
        cid: sampleFileIpfsInfo.hash.toString(),
        options: { provider: ipfsProvider },
      },
      clientWithBadProvider,
      fsUri
    );

    if (!resolveResult.ok) fail(resolveResult.error);
    expect(resolveResult.value).toEqual({
      cid: `/ipfs/${sampleFileIpfsInfo.hash.toString()}`,
      provider: ipfsProvider,
    });
  });

  it("Should use fallback provider from method options", async () => {
    const clientWithBadProvider = new PolywrapClient({
      envs: [
        {
          uri: fsUri,
          env: {
            provider: "this-provider-doesnt-exist",
          },
        },
      ],
    });

    const catResult = await Ipfs_Module.cat(
      {
        cid: sampleFileIpfsInfo.hash.toString(),
        options: {
          provider: "this-provider-also-doesnt-exist",
          fallbackProviders: [ipfsProvider],
        },
      },
      clientWithBadProvider,
      fsUri
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
      fsUri
    );

    if (!resolveResult.ok) fail(resolveResult.error);
    expect(resolveResult.value).toEqual({
      cid: `/ipfs/${sampleFileIpfsInfo.hash.toString()}`,
      provider: ipfsProvider,
    });
  });
});
