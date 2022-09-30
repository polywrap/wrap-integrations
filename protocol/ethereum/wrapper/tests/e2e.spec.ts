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
import {
  deployStorage,
  addPrimitiveToArrayStorage,
  addStructToStorage,
  setPrimitiveToStorage
} from './utils/storage';
import { Wallet } from "ethers";
import * as path from 'path'

import { ethers } from "ethers";
import { keccak256 } from "js-sha3";
import { ethereumProviderPlugin } from "../../provider/src";
import * as Schema from "./types/wrap";

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

    client = new PolywrapClient({
      plugins: [
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
          plugin: ethereumProviderPlugin({
	    url: providers.ethereum, 
	    wallet: new Wallet("0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d")
	  }),
        },
      ],
    });

  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  describe("EthereumWrapper", () => {
    it("chainId", async () => {
      const response = await client.invoke<string>({
        uri,
        method: "getChainId",
        args: {},
      });

      expect(response.error).toBeUndefined();
      expect(response.data).toBeDefined();
      expect(response.data).toBe("1337");
    });

    it("getBalance", async () => {
      const response = await client.invoke<string>({
        uri,
        method: "getBalance",
        args: {
          address: signer,
        },
      });

      expect(response.error).toBeUndefined();
      expect(response.data).toBeDefined();
    });

    it("checkAddress", async () => {
      const response = await client.invoke<string>({
        uri,
        method: "checkAddress",
        args: {
          address: signer,
        },
      });

      expect(response.error).toBeUndefined();
      expect(response.data).toBeDefined();
      expect(response.data).toEqual(true);
    });

    it("getGasPrice", async () => {
      const response = await client.invoke<string>({
        uri,
        method: "getGasPrice"
      });

      expect(response.error).toBeUndefined();
      expect(response.data).toBeDefined();
    });

    it("signMessage", async () => {
      const response = await client.invoke<string>({
        uri,
        method: "signMessage",
        args: {
          message: "Hello World"
        }
      });

      expect(response.error).toBeUndefined();
      expect(JSON.parse(response.data)).toBe(
        "0xa4708243bf782c6769ed04d83e7192dbcf4fc131aa54fde9d889d8633ae39dab03d7babd2392982dff6bc20177f7d887e27e50848c851320ee89c6c63d18ca761c"
      );
    });

    it("encodeParams", async () => {
      const response = await client.invoke<string>({
        uri,
        method: "encodeParams",
        args: {
          types: ["uint256", "uint256", "address"],
          values: ["8", "16", "0x0000000000000000000000000000000000000000"],
        },
      });

      expect(JSON.parse(response.data)).toBe(
        "0x000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000"
      );

      // TODO: test tuple
    });

    it("encodeFunction", async () => {
      const response = await client.invoke<string>({
        uri,
        method: "encodeFunction",
        args: {
          method: "function increaseCount(uint256)",
          args: ["100"],
        },
      });

      expect(response.error).toBeUndefined();
      expect(JSON.parse(response.data)).toBe(
        "0x46d4adf20000000000000000000000000000000000000000000000000000000000000064"
      );

      const acceptsArrayArg = await client.invoke<string>({
        uri,
        method: "encodeFunction",
        args: {
          method: "function createArr(uint256[] memory)",
          args: [JSON.stringify([1, 2])],
        },
      });

      expect(acceptsArrayArg.error).toBeUndefined();
    });

    it("callContractView", async () => {
      const node = namehash("whatever.eth");
      const response = await client.invoke<string>({
        uri,
        method: "callContractView",
        args: {
          address: ensAddress,
          method: "function resolver(bytes32 node) external view returns (address)",
          args: [node]
        }
      });

      expect(response.error).toBeUndefined();
      expect(response.data).toBeDefined();
      expect(response.data).toBe("0x0000000000000000000000000000000000000000");
    });

    it("callContractView (primitive value - string ABI)", async () => {
      const storageAddress = await deployStorage(contracts.SimpleStorage.abi, contracts.SimpleStorage.bytecode)
      await setPrimitiveToStorage(contracts.SimpleStorage.abi, storageAddress, "100");

      const response = await client.invoke<string>({
        uri,
        method: "callContractView",
        args: {
          address: storageAddress,
          method: 'function get() public view returns (uint256)',
          args: [],
        },
      });

      expect(response.error).toBeUndefined();
      expect(response.data).toBeDefined();
      const num = ethers.BigNumber.from(response.data);
      expect(num.eq("100")).toBeTruthy();
    });

    it("callContractView (primitive value - JSON ABI)", async () => {
      const storageAddress = await deployStorage(contracts.SimpleStorage.abi, contracts.SimpleStorage.bytecode)
      await setPrimitiveToStorage(contracts.SimpleStorage.abi, storageAddress, "100");

      const response = await client.invoke<string>({
        uri,
        method: "callContractView",
        args: {
          address: storageAddress,
          method: contracts.SimpleStorage.abiSinglePrimitiveMethod,
          args: [],
        },
      });

      expect(response.error).toBeUndefined();
      expect(response.data).toBeDefined();
      const num = ethers.BigNumber.from(response.data);
      expect(num.eq("100")).toBeTruthy();
    });

    it("callContractView (primitives array - string ABI)", async () => {
      const storageAddress = await deployStorage(contracts.SimpleStorage.abi, contracts.SimpleStorage.bytecode)
      await addPrimitiveToArrayStorage(contracts.SimpleStorage.abi, storageAddress, "100");
      await addPrimitiveToArrayStorage(contracts.SimpleStorage.abi, storageAddress, "90");

      const response = await client.invoke<string>({
        uri,
        method: "callContractView",
        args: {
          address: storageAddress,
          method: 'function getSimple() public view returns (uint256[] memory)',
          args: [],
        },
      });

      if (!response.data) {
        throw new Error('Empty data on view call, expecting JSON');
      }
      const result = JSON.parse(response.data);

      expect(result.length).toEqual(2);
      expect(result[0]).toEqual("100");
      expect(result[1]).toEqual("90");
    });

    it("callContractView (primitives array - JSON ABI)", async () => {
      const storageAddress = await deployStorage(contracts.SimpleStorage.abi, contracts.SimpleStorage.bytecode)
      await addPrimitiveToArrayStorage(contracts.SimpleStorage.abi, storageAddress, "100");
      await addPrimitiveToArrayStorage(contracts.SimpleStorage.abi, storageAddress, "90");

      const response = await client.invoke<string>({
        uri,
        method: "callContractView",
        args: {
          address: storageAddress,
          method: contracts.SimpleStorage.abiArrayPrimitivesMethod,
          args: [],
        },
      });

      if (!response.data) {
        throw new Error('Empty data on view call, expecting JSON');
      }
      const result = JSON.parse(response.data);

      expect(result.length).toEqual(2);
      expect(result[0]).toEqual("100");
      expect(result[1]).toEqual("90");
    });

    it("callContractView (primitives array - non-array JSON ABI)", async () => {
      const storageAddress = await deployStorage(contracts.SimpleStorage.abi, contracts.SimpleStorage.bytecode)
      await addPrimitiveToArrayStorage(contracts.SimpleStorage.abi, storageAddress, "100");
      await addPrimitiveToArrayStorage(contracts.SimpleStorage.abi, storageAddress, "90");

      const response = await client.invoke<string>({
        uri,
        method: "callContractView",
        args: {
          address: storageAddress,
          method: '{"inputs":[],"name":"getSimple","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"}',
          args: [],
        },
      });

      if (!response.data) {
        throw new Error('Empty data on view call, expecting JSON');
      }
      const result = JSON.parse(response.data);

      expect(result.length).toEqual(2);
      expect(result[0]).toEqual("100");
      expect(result[1]).toEqual("90");
    });

    it("callContractView (struct array empty)", async () => {
      const queueAddress = await deployStorage(contracts.SimpleStorage.abi, contracts.SimpleStorage.bytecode)

      const response = await client.invoke<string>({
        uri,
        method: "callContractView",
        args: {
          address: queueAddress,
          method: contracts.SimpleStorage.abiArrayStructsMethod,
          args: [],
        },
      });

      expect(response.data).toEqual('[]');
    });

    it("callContractView (struct array single element)", async () => {
      const queueAddress = await deployStorage(contracts.SimpleStorage.abi, contracts.SimpleStorage.bytecode)
      await addStructToStorage(contracts.SimpleStorage.abi, queueAddress, [queueAddress, "100"]);

      const response = await client.invoke<string>({
        uri,
        method: "callContractView",
        args: {
          address: queueAddress,
          method: contracts.SimpleStorage.abiArrayStructsMethod,
          args: [],
        },
      });

      if (!response.data) {
        throw new Error('Empty data on view call, expecting JSON');
      }
      const result = JSON.parse(response.data);

      expect(result.length).toEqual(1);
      expect(result[0].to).toEqual(queueAddress);
      expect(result[0].amount).toEqual("100");
    });

    it("callContractView (struct array multiple elements)", async () => {
      const queueAddress = await deployStorage(contracts.SimpleStorage.abi, contracts.SimpleStorage.bytecode)
      await addStructToStorage(contracts.SimpleStorage.abi, queueAddress, [queueAddress, "100"]);
      await addStructToStorage(contracts.SimpleStorage.abi, queueAddress, [ensAddress, "99"]);

      const response = await client.invoke<string>({
        uri,
        method: "callContractView",
        args: {
          address: queueAddress,
          method: contracts.SimpleStorage.abiArrayStructsMethod,
          args: [],
        },
      });

      if (!response.data) {
        throw new Error('Empty data on view call, expecting JSON');
      }
      const result = JSON.parse(response.data);

      expect(result.length).toEqual(2);
      expect(result[0].to).toEqual(queueAddress);
      expect(result[0].amount).toEqual("100");
      expect(result[1].to).toEqual(ensAddress);
      expect(result[1].amount).toEqual("99");
    });

    it("callContractStatic (no error)", async () => {
      const label = "0x" + keccak256("testwhatever");
      const response = await client.invoke<Schema.StaticTxResult>({
        uri,
        method: "callContractStatic",
        args: {
          address: registrarAddress,
          method: "function register(bytes32 label, address owner)",
          args: [label, signer],
        },
      });

      expect(response.error).toBeUndefined();
      expect(response.data?.error).toBeFalsy();
      expect(response.data?.result).toBe("");
    });

    it("callContractStatic (expecting error)", async () => {
      const label = "0x" + keccak256("testwhatever");
      const response = await client.invoke<Schema.StaticTxResult>({
        uri,
        method: "callContractStatic",
        args: {
          address: registrarAddress,
          method: "function registerr(bytes32 label, address owner)",
          args: [label, signer],
        },
      });

      expect(response.error).toBeUndefined();
      expect(response.data).toBeDefined();
      expect(response.data?.error).toBeTruthy();
      expect(response.data?.result).toContain(
        "missing revert data in call exception"
      );
    });

    it("awaitTransaction", async () => {
      const data = contracts.SimpleStorage.bytecode;

      const response = await client.invoke<Schema.TxResponse>({
        uri,
        method: "sendTransaction",
        args: {
          tx: {
            data: data,
          },
        },
      });

      expect(response.error).toBeUndefined();
      expect(response.data?.hash).toBeTruthy();
      const txHash = response.data?.hash as string;

      const awaitResponse = await client.invoke<Schema.TxReceipt>({
        uri,
        method: "awaitTransaction",
        args: {
          txHash: txHash,
          confirmations: 1,
          timeout: 60000,
        },
      });

      expect(awaitResponse.error).toBeUndefined();
      expect(awaitResponse.data).toBeDefined();
      expect(awaitResponse.data?.transactionHash).toBeDefined();
    });

    it("callContractMethod", async () => {
      const label = "0x" + keccak256("testwhatever");
      const response = await client.invoke({
        uri,
        method: "callContractMethod",
        args: {
          address: registrarAddress,
          method: "function register(bytes32 label, address owner)",
          args: [label, signer],
        }
      });

      // TODO: add txOverrides

      expect(response.error).toBeUndefined();
      expect(response.data).toBeDefined();
    });

    it("callContractMethodAndWait", async () => {
      const label = "0x" + keccak256("testwhatever");
      const response = await client.invoke<Schema.TxReceipt>({
        uri,
        method: "callContractMethodAndWait",
        args: {
          address: registrarAddress,
          method: "function register(bytes32 label, address owner)",
          args: [label, signer],
        }
      });

      expect(response.error).toBeUndefined();
      expect(response.data).toBeDefined();
    });

    it("sendTransaction", async () => {
      const response = await client.invoke<Schema.TxResponse>({
        uri,
        method: "sendTransaction",
        args: {
          tx: { data: contracts.SimpleStorage.bytecode }
        }
      });

      expect(response.error).toBeUndefined();
      expect(response.data).toBeDefined();
      expect(response.data?.hash).toBeDefined();
    });

    it("sendTransactionAndWait", async () => {
      const response = await client.invoke<Schema.TxReceipt>({
        uri,
        method: "sendTransactionAndWait",
        args: {
          tx: { data: contracts.SimpleStorage.bytecode }
        }
      });

      expect(response.error).toBeUndefined();
      expect(response.data).toBeDefined();
      expect(
        response.data?.transactionHash
      ).toBeDefined();
    });

    it("estimateTransactionGas", async () => {
      const data = contracts.SimpleStorage.bytecode;

      const response = await client.invoke<string>({
        uri,
        method: "estimateTransactionGas",
        args: {
          tx: {
            data: data,
          },
        },
      });

      expect(response.error).toBeUndefined();
      expect(response.data).toBeDefined();
      const num = ethers.BigNumber.from(response.data);
      expect(num.gt(0)).toBeTruthy();
    });

    it("estimateContractCallGas", async () => {
      const label = "0x" + keccak256("testwhatever2");
      const response = await client.invoke<string>({
        uri,
        method: "estimateContractCallGas",
        args: {
          address: registrarAddress,
          method: "function register(bytes32 label, address owner)",
          args: [label, signer],
        },
      });

      expect(response.data).toBeDefined();
      expect(response.error).toBeUndefined();
      const num = ethers.BigNumber.from(response.data);
      expect(num.gt(0)).toBeTruthy();
    });

    it("sendRPC", async () => {
      const res = await client.invoke<string | undefined>({
        uri,
        method: "sendRPC",
        args: {
          method: "eth_blockNumber", params: []
        }
      });

      expect(res.error).toBeUndefined();
      expect(res.data).toBeDefined();
    });
  });

  });
});
