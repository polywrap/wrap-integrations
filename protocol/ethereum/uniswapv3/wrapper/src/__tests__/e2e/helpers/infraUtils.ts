import { buildWrapper, runCLI } from "@polywrap/test-env-js";
import axios from "axios";
import { ClientConfig } from "@polywrap/client-js";
import { ethereumPlugin, Connections, Connection } from "@polywrap/ethereum-plugin-js";
import path from "path";

export async function buildDependencies(): Promise<{ sha3Uri: string, graphUri: string }> {
  const relSystemWrappersPath = path.join(__dirname, "../../../../../../../../system");
  const systemsWrappersPath = path.resolve(relSystemWrappersPath);
  const sha3Path = path.join(systemsWrappersPath, "sha3", "wrapper");
  const graphNodePath = path.join(systemsWrappersPath, "graph-node", "wrapper");
  // await buildWrapper(sha3Path, undefined, true);
  // await buildWrapper(graphNodePath);
  const sha3Uri = `wrap://fs/${sha3Path}/build`;
  const graphUri = `wrap://fs/${graphNodePath}/build`;
  return { sha3Uri, graphUri };
}

export function getConfig(sha3Uri: string, graphUri: string): Partial<ClientConfig> {
  return {
    envs: [
      {
        uri: "wrap://ens/graph-node.polywrap.eth",
        env: {
          provider: "https://api.thegraph.com",
        },
      },
      {
        uri: "wrap://ens/ipfs.polywrap.eth",
        env:{
          provider: "https://ipfs.wrappers.io",
          fallbackProviders: ["https://ipfs.io", "http://localhost:48084", "http://127.0.0.1:45005"],
        },
      },
    ],
    redirects: [
      {
        from: "wrap://ens/sha3.polywrap.eth",
        to: sha3Uri,
      },
      {
        from: "wrap://ens/graph-node.polywrap.eth",
        to: graphUri,
      },
    ],
    packages: [
      {
        uri: "wrap://ens/ethereum.polywrap.eth",
        package: ethereumPlugin({
          connections: new Connections({
            networks: {
              mainnet: new Connection({ provider: "http://localhost:8546" }),
            },
            defaultNetwork: "mainnet",
          }),
        }),
      },
    ]
  };
}

export async function initInfra(): Promise<void> {
  const { exitCode, stderr, stdout } = await runCLI({
    args: ["infra", "up", "--verbose"]
  });

  if (exitCode) {
    throw Error(
      `initInfra failed to start test environment.\nExit Code: ${exitCode}\nStdErr: ${stderr}\nStdOut: ${stdout}`
    );
  }

  const success = await awaitResponse(
    `http://localhost:8546`,
    '"jsonrpc":',
    "post",
    2000,
    20000,
    '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":83}'
  );
  if (!success) {
    throw Error("initInfra: Ganache failed to start");
  }

  return Promise.resolve();
}

export async function stopInfra(): Promise<void> {
  const { exitCode, stderr, stdout } = await runCLI({
    args: ["infra", "down", "--verbose"]
  });

  if (exitCode) {
    throw Error(
      `initInfra failed to stop test environment.\nExit Code: ${exitCode}\nStdErr: ${stderr}\nStdOut: ${stdout}`
    );
  }

  return Promise.resolve();
}

async function awaitResponse(
  url: string,
  expectedRes: string,
  getPost: "get" | "post",
  timeout: number,
  maxTimeout: number,
  data?: string
) {
  let time = 0;

  while (time < maxTimeout) {
    const request = getPost === "get" ? axios.get(url) : axios.post(url, data);
    const success = await request
      .then(function (response) {
        const responseData = JSON.stringify(response.data);
        return responseData.indexOf(expectedRes) > -1;
      })
      .catch(function () {
        return false;
      });

    if (success) {
      return true;
    }

    await new Promise<void>(function (resolve) {
      setTimeout(() => resolve(), timeout);
    });

    time += timeout;
  }

  return false;
}