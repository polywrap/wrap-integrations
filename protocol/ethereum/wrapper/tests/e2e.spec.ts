import { PolywrapClient } from "@polywrap/client-js";
import { WrapManifest } from "@polywrap/wrap-manifest-types-js";
import { defaultIpfsProviders } from "@polywrap/client-config-builder-js";
import { Client, PluginModule } from "@polywrap/core-js";
import { ensResolverPlugin } from "@polywrap/ens-resolver-plugin-js";
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js";
import {
  initTestEnvironment,
  stopTestEnvironment,
  buildWrapper,
  ensAddresses,
  providers,
} from "@polywrap/test-env-js";
import { Wallet } from "ethers";
import * as path from 'path'

import { ethers } from "ethers";
import { keccak256 } from "js-sha3";
import { Connections, Connection, ethereumPlugin } from "@polywrap/ethereum-plugin-js";
import { ethereumProviderPlugin } from "../../provider/src";

const { hash: namehash } = require("eth-ens-namehash");
const contracts = {
  StructArg: {
    abi: require("./contracts/StructArg.ABI.json"),
    bytecode: `0x${require("./contracts/StructArg.Bytecode.json").object}`,
  },
  SimpleStorage: {
    abi: require("./contracts/SimpleStorage.ABI.json"),
    bytecode: `0x${require("./contracts/SimpleStorage.Bytecode.json").object}`,
  },
};

jest.setTimeout(360000);

describe("Ethereum Plugin", () => {
  let client: PolywrapClient;
  let ensAddress: string;
  let resolverAddress: string;
  let registrarAddress: string;
  const signer = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1";

  const dirname: string = path.resolve(__dirname);
  const wrapperPath: string = path.join(dirname, "..");
  const uri = `fs/${wrapperPath}/build`;

  beforeAll(async () => {
    await initTestEnvironment();

    ensAddress = ensAddresses.ensAddress;
    resolverAddress = ensAddresses.resolverAddress;
    registrarAddress = ensAddresses.registrarAddress;

    const connections = new Connections({
      networks: {
        testnet: new Connection({
          provider: providers.ethereum,
          signer: new Wallet(
            "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"
          ),
        }),
      },
      defaultNetwork: "testnet",
    });

    client = new PolywrapClient({
      plugins: [
        {
          uri: "wrap://ens/ethereum.polywrap.eth",
          plugin: ethereumPlugin({ connections }),
        },
        {
          uri: "wrap://ens/ipfs.polywrap.eth",
          plugin: ipfsPlugin({
            provider: providers.ipfs,
            fallbackProviders: defaultIpfsProviders,
          }),
        },
        {
          uri: "wrap://ens/ens-resolver.polywrap.eth",
          plugin: ensResolverPlugin({
            addresses: {
              testnet: ensAddress,
            },
          }),
        },
        {
          uri: "wrap://ens/ethereum-provider.polywrap.eth",
          plugin: ethereumProviderPlugin({url: "https://bsc-dataseed1.binance.org/"}),
        },
      ],
    });

  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  describe("EthereumWrapper", () => {
    it.only("chainId", async () => {
      const response = await client.invoke<string>({
        uri,
        method: "chainId",
        args: {},
      });

      expect(response.error).toBeUndefined();
      expect(response.data).toBeDefined();
      expect(response.data).toBe("56");
    });
  });
});

