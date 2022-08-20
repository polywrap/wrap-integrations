import {
  buildAndDeployWrapper,
  initTestEnvironment,
  stopTestEnvironment,
  providers as testEnvProviders,
  ensAddresses, buildWrapper
} from "@polywrap/test-env-js";
import { PolywrapClient } from "@polywrap/client-js";
import path from "path";
import { providers } from "ethers";

import { getPlugins } from "./utils";

jest.setTimeout(300000);

describe("ENS Wrapper", () => {
  // We will have two clients because we need two
  // different signers in order to test ENS functions
  let ownerClient: PolywrapClient;
  let anotherOwnerClient: PolywrapClient;

  let ensUri: string;
  let ethersProvider: providers.JsonRpcProvider;
  let registryAddress: string;
  let registrarAddress: string;
  let resolverAddress: string;
  let reverseRegistryAddress: string;
  let customFifsRegistrarAddress: string;

  let owner: string;
  let anotherOwner: string;

  const customTld: string = "doe.eth";
  const openSubdomain: string = "open." + customTld;
  const customSubdomain: string = "john." + customTld;

  const network: string = "testnet";

  beforeAll(async () => {
    await initTestEnvironment();

    // deploy api
    const apiPath: string = path.resolve(__dirname + "/../../");
    const api = await buildAndDeployWrapper({
      wrapperAbsPath: apiPath,
      ethereumProvider: testEnvProviders.ethereum,
      ipfsProvider: testEnvProviders.ipfs,
      ensName: "test-domain.eth"
    });
    ensUri = `ens/testnet/${api.ensDomain}`;

    // set up ethers provider
    ethersProvider = providers.getDefaultProvider(
      testEnvProviders.ethereum
    ) as providers.JsonRpcProvider;
    owner = await ethersProvider.getSigner(0).getAddress();
    anotherOwner = await ethersProvider.getSigner(1).getAddress();
    registryAddress = ensAddresses.ensAddress;
    registrarAddress = ensAddresses.registrarAddress;
    resolverAddress = ensAddresses.resolverAddress;
    reverseRegistryAddress = ensAddresses.reverseAddress;

    // build sha3 wrapper
    const sha3Path = path.resolve(path.join(__dirname, "../../../../../../system/sha3/wrapper"));
    await buildWrapper(sha3Path);
    const sha3Uri = `wrap://fs/${sha3Path}/build`;

    // build uts46 wrapper
    const uts46Path = path.resolve(path.join(__dirname, "../../../../../../system/uts46-lite/wrapper"));
    await buildWrapper(uts46Path);
    const uts46Uri = `wrap://fs/${uts46Path}/build`;

    // get client
    const plugins = getPlugins(testEnvProviders.ethereum, testEnvProviders.ipfs, ensAddresses.ensAddress);
    const redirects = [
      {
        from: "wrap://ens/uts46.polywrap.eth",
        to: uts46Uri
      },
      {
        from: "wrap://ens/sha3.polywrap.eth",
        to: sha3Uri
      }
    ];
    ownerClient = new PolywrapClient({ plugins, redirects });

    const anotherOwnerRedirects = getPlugins(
      testEnvProviders.ethereum, 
      testEnvProviders.ipfs, 
      ensAddresses.ensAddress, 
      anotherOwner
    );
    anotherOwnerClient = new PolywrapClient({ plugins: anotherOwnerRedirects, redirects });
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  it("should register domain", async () => {
    const {
      data: registerData,
      error: registerError,
    } = await ownerClient.invoke<string>({
      uri: ensUri,
      method: "registerDomain",
      args: {
        domain: customTld,
        owner,
        registryAddress,
        registrarAddress: registrarAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(registerError).toBeUndefined();
    expect(registerData).toBeDefined();
  });

  it("should set and get resolver", async () => {
    const {
      data: setResolverData,
      error: setResolverError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "setResolver", 
      args: {
        domain: customTld,
        owner,
        registryAddress,
        resolverAddress: resolverAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(setResolverError).toBeUndefined();
    expect(setResolverData).toBeDefined();

    const {
      data: getResolverData,
      error: getResolverError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "getResolver",
      args: {
        domain: customTld,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(getResolverError).toBeUndefined();
    expect(getResolverData).toEqual(resolverAddress);
  });

  it("should set owner of subdomain and fetch it", async () => {
    const subdomain = "bob." + customTld;

    const {
      data: setSubdomainOwnerData,
      error: setSubdomainError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "setSubdomainOwner",
      args: {
        subdomain,
        owner,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(setSubdomainError).toBeUndefined();
    expect(setSubdomainOwnerData).toBeDefined();

    const {
      data: getOwnerData,
      error: getOwnerError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "getOwner",
      args: {
        domain: subdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(getOwnerError).toBeUndefined();
    expect(getOwnerData).toBeDefined();
  });

  it("should register domain with subdomains recursively and fetch it", async () => {
    const domain = "foo.bar.baz.mydomain.eth";

    const {
      data: registerDomainAndSubdomainsRecursivelyData,
      error: registerDomainAndSubdomainsRecursivelyError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "registerDomainAndSubdomainsRecursively",
      args: {
        domain,
        owner,
        registryAddress,
        resolverAddress,
        registrarAddress,
        ttl: '0',
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(registerDomainAndSubdomainsRecursivelyError).toBeUndefined();
    expect(registerDomainAndSubdomainsRecursivelyData).toBeDefined();
    
    const resultingRegistrations = registerDomainAndSubdomainsRecursivelyData as any[];

    expect(resultingRegistrations[0]?.name).toBe("mydomain.eth")
    expect(resultingRegistrations[0]?.didRegister).toBe(true)
    expect(resultingRegistrations[1]?.name).toBe("baz.mydomain.eth")
    expect(resultingRegistrations[1]?.didRegister).toBe(true)
    expect(resultingRegistrations[2]?.name).toBe("bar.baz.mydomain.eth")
    expect(resultingRegistrations[2]?.didRegister).toBe(true)
    expect(resultingRegistrations[3]?.name).toBe("foo.bar.baz.mydomain.eth")
    expect(resultingRegistrations[3]?.didRegister).toBe(true)

    const {
      data: getOwnerData,
      error: getOwnerError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "getOwner",
      args: {
        domain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(getOwnerError).toBeUndefined();
    expect(getOwnerData).toBeDefined();
    expect(getOwnerData).toBe(owner);

    // No subdomain

    const domainWithNoSubdomain = "sumtin.eth";
  
    const {
      data: domainWithNoSubdomainData,
      error: domainWithNoSubdomainError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "registerDomainAndSubdomainsRecursively",
      args: {
        domain: domainWithNoSubdomain,
        owner,
        registryAddress,
        resolverAddress,
        registrarAddress,
        ttl: '0',
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(domainWithNoSubdomainError).toBeUndefined();
    expect(domainWithNoSubdomainData).toBeDefined();
    
    const domainWithNoSubdomainRegistrations = domainWithNoSubdomainData as any[];

    expect(domainWithNoSubdomainRegistrations[0]?.name).toBe("sumtin.eth")
  });

  it("should not attempt to re-register registered subdomains/domains when recursively registering", async () => {
    const rootDomain = "domain.eth"
    const label = "sub"
    const tld = `${label}.${rootDomain}`
    const subdomain = `already.registered.${tld}`;

    await ownerClient.invoke<string>({
      uri: ensUri,
      method: "",
      args: {
        domain: tld,
        owner,
        registryAddress,
        registrarAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    await ownerClient.invoke<string>({
      uri: ensUri,
      method: "registerDomain",
      args: {
        domain: rootDomain,
        owner,
        registryAddress,
        registrarAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    await ownerClient.invoke({
      uri: ensUri,
      method: "setSubdomainRecord",
      args: {
        domain: rootDomain,
        label,
        owner,
        registryAddress,
        resolverAddress,
        ttl: '0',
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    const {
      data: registerDomainAndSubdomainsRecursivelyData,
      error: registerDomainAndSubdomainsRecursivelyError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "registerDomainAndSubdomainsRecursively",
      args: {
        domain: subdomain,
        owner,
        registryAddress,
        resolverAddress,
        registrarAddress,
        ttl: '0',
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(registerDomainAndSubdomainsRecursivelyError).toBeUndefined();
    expect(registerDomainAndSubdomainsRecursivelyData).toBeDefined();
    
    const resultingRegistrations = registerDomainAndSubdomainsRecursivelyData as any[];

    expect(resultingRegistrations[0]?.name).toBe("domain.eth")
    expect(resultingRegistrations[0]?.didRegister).toBe(false)
    expect(resultingRegistrations[1]?.name).toBe("sub.domain.eth")
    expect(resultingRegistrations[1]?.didRegister).toBe(false)
    expect(resultingRegistrations[2]?.name).toBe("registered.sub.domain.eth")
    expect(resultingRegistrations[2]?.didRegister).toBe(true)
    expect(resultingRegistrations[3]?.name).toBe("already.registered.sub.domain.eth")
    expect(resultingRegistrations[3]?.didRegister).toBe(true)

    const {
      data: getOwnerData,
      error: getOwnerError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "getOwner",
      args: {
        domain: subdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      },
    });

    expect(getOwnerError).toBeUndefined();
    expect(getOwnerData).toBeDefined();
    expect(getOwnerData).toBe(owner);
  });

  it("should register subdomain recursively and fetch it", async () => {
    const tld = "basedomain.eth";
    const subdomain = `aaa.bbb.ccc.${tld}`;

    await ownerClient.invoke<string>({
      uri: ensUri,
      method: "registerDomain",
      args: {
        domain: tld,
        owner,
        registrarAddress,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    const {
      data: registerSubdomainsRecursivelyData,
      error: registerSubdomainsRecursivelyError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "registerSubdomainsRecursively",
      args: {
        domain: subdomain,
        owner,
        registryAddress,
        resolverAddress,
        registrarAddress,
        ttl: '0',
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(registerSubdomainsRecursivelyError).toBeUndefined();
    expect(registerSubdomainsRecursivelyData).toBeDefined();
    
    const resultingRegistrations = registerSubdomainsRecursivelyData as any[];

    expect(resultingRegistrations[0]?.name).toBe("ccc.basedomain.eth")
    expect(resultingRegistrations[0]?.didRegister).toBe(true)
    expect(resultingRegistrations[1]?.name).toBe("bbb.ccc.basedomain.eth")
    expect(resultingRegistrations[1]?.didRegister).toBe(true)
    expect(resultingRegistrations[2]?.name).toBe("aaa.bbb.ccc.basedomain.eth")
    expect(resultingRegistrations[2]?.didRegister).toBe(true)

    const {
      data: getOwnerData,
      error: getOwnerError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "getOwner",
      args: {
        domain: subdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(getOwnerError).toBeUndefined();
    expect(getOwnerData).toBeDefined();
    expect(getOwnerData).toBe(owner);
  });

  it("should set subdomain owner, resolver and ttl", async () => {
    const {
      data: setSubdomainRecordData,
      error: setSubdomainRecordError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "setSubdomainRecord",
      args: {
        domain: customTld,
        label: "john",
        owner: anotherOwner,
        registryAddress,
        resolverAddress,
        ttl: '0',
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(setSubdomainRecordError).toBeUndefined();
    expect(setSubdomainRecordData).toBeDefined();

    const {
      data: getOwnerData,
      error: getOwnerError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "getOwner",
      args: {
        domain: customSubdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });
    expect(getOwnerError).toBeUndefined();
    expect(getOwnerData).toEqual(anotherOwner);
  });

  it("should update and fetch owner", async () => {
    const {
      data: getOldOwnerData,
      error: getOldOwnerError,
    } = await anotherOwnerClient.invoke({
      uri: ensUri,
      method: "getOwner",
      args: {
        domain: customSubdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(getOldOwnerError).toBeUndefined();
    expect(getOldOwnerData).toEqual(anotherOwner);

    const {
      data: setOwnerData,
      error: setOwnerError,
    } = await anotherOwnerClient.invoke({
      uri: ensUri,
      method: "setOwner",
      args: {
        domain: customSubdomain,
        newOwner: owner,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(setOwnerError).toBeUndefined();
    expect(setOwnerData).toBeDefined();

    const {
      data: getNewOwnerData,
      error: getNewOwnerError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "getOwner",
      args: {
        domain: customSubdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(getNewOwnerError).toBeUndefined();
    expect(getNewOwnerData).toEqual(owner);
  });

  it("should set content hash and fetch it", async () => {
    const cid = "0x64EC88CA00B268E5BA1A35678A1B5316D212F4F366B2477232534A8AECA37F3C".toLowerCase();

    const {
      data: setContentHashData,
      error: setContentHashError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "setContentHash",
      args: {
        domain: customSubdomain,
        cid,
        resolverAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(setContentHashError).toBeUndefined();
    expect(setContentHashData).toBeDefined();

    const {
      data: getContentHashData,
      error: getContentHashError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "getContentHash",
      args: {
        domain: customSubdomain,
        resolverAddress,
        connection: {
          networkNameOrChainId: network
        }
      },
    });

    expect(getContentHashError).toBeUndefined();
    expect(getContentHashData).toEqual(cid);

    const {
      data: getContentHashFromDomainData,
      error: getContentHashFromDomainError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "getContentHashFromDomain",
      args: {
        domain: customSubdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(getContentHashFromDomainError).toBeUndefined();
    expect(getContentHashFromDomainData).toEqual(cid);
  });

  it("should set address and fetch it", async () => {
    const {
      data: setAddressData,
      error: setAddressError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "setAddress",
      args: {
        domain: customTld,
        address: anotherOwner,
        resolverAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(setAddressError).toBeUndefined();
    expect(setAddressData).toBeDefined();

    const {
      data: getAddressData,
      error: getAddressError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "getAddress",
      args: {
        domain: customTld,
        resolverAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(getAddressError).toBeUndefined();
    expect(getAddressData).toEqual(anotherOwner);

    const {
      data: getAddressFromDomainData,
      error: getAddressFromDomainError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "getAddressFromDomain",
      args: {
        domain: customTld,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(getAddressFromDomainError).toBeUndefined();
    expect(getAddressFromDomainData).toEqual(anotherOwner);
  });

  it("should set reverse registry", async () => {
    const {
      data: reverseRegistryData,
      error: reverseRegistryError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "reverseRegisterDomain",
      args: {
        domain: customTld,
        reverseRegistryAddress,
        owner,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(reverseRegistryError).toBeUndefined();
    expect(reverseRegistryData).toBeDefined();
  });

  it("should fetch name based on address from registry and resolver", async () => {
    const {
      data: getNameFromAddressData,
      error: getNameFromAddressError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "getNameFromAddress",
      args: {
        address: owner,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(getNameFromAddressError).toBeUndefined();
    expect(getNameFromAddressData).toEqual(customTld);

    const {
      data: getNameFromReverseResolverData,
      error: getNameFromReverseResolverError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "getNameFromReverseResolver",
      args: {
        address: owner,
        resolverAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(getNameFromReverseResolverError).toBeUndefined();
    expect(getNameFromReverseResolverData).toEqual(customTld);
  });

  it("should set and get text record from subdomain", async () => {
    const key = "snapshot";
    const value = "QmHash";

    const {
      data: setTextRecordData,
      error: setTextRecordError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "setTextRecord",
      args: {
        domain: customTld,
        resolverAddress,
        key,
        value,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(setTextRecordError).toBeUndefined();
    expect(setTextRecordData).toBeDefined();

    const {
      data: getTextRecordData,
      error: getTextRecordError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "getTextRecord",
      args: {
        domain: customTld,
        resolverAddress,
        key,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(getTextRecordError).toBeUndefined();
    expect(getTextRecordData).toEqual(value);
  });

  it("should configure open domain", async () => {
    const {
      data: configureOpenDomainData,
      error: configureOpenDomainError,
    } = await ownerClient.invoke<{
        fifsRegistrarAddress: string;
        setOwnerTxReceipt: any;
      }>({
      uri: ensUri,
      method: "configureOpenDomain",
      args: {
        tld: openSubdomain,
        owner,
        registryAddress,
        resolverAddress,
        registrarAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(configureOpenDomainError).toBeUndefined();
    expect(configureOpenDomainData).toBeDefined();

    const { data: getOwnerData } = await ownerClient.invoke({
      uri: ensUri,
      method: "getOwner",
      args: {
        domain: openSubdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(getOwnerData).toEqual(
      configureOpenDomainData?.fifsRegistrarAddress
    );

    customFifsRegistrarAddress = configureOpenDomainData?.fifsRegistrarAddress!;
  });

  it("should create subdomain in open domain", async () => {
    const {
      data: createSubdomainInOpenDomainData,
      error: createSubdomainInOpenDomainError,
    } = await anotherOwnerClient.invoke({
      uri: ensUri,
      method: "createSubdomainInOpenDomain",
      args: {
        label: "label",
        domain: openSubdomain,
        owner: anotherOwner,
        fifsRegistrarAddress: customFifsRegistrarAddress,
        registryAddress,
        resolverAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(createSubdomainInOpenDomainError).toBeUndefined();
    expect(createSubdomainInOpenDomainData).toBeDefined();
  });

  it("should create subdomain in open domain and set content hash", async () => {
    const cid = "0x64EC88CA00B268E5BA1A35678A1B5316D212F4F366B2477232534A8AECA37F3C".toLowerCase();

    const {
      data: createSubdomainInOpenDomainAndSetContentHashData,
      error: createSubdomainInOpenDomainAndSetContentHashError,
    } = await anotherOwnerClient.invoke({
      uri: ensUri,
      method: "createSubdomainInOpenDomainAndSetContentHash",
      args: {
        cid,
        label: "label2",
        domain: openSubdomain,
        owner: anotherOwner,
        fifsRegistrarAddress: customFifsRegistrarAddress,
        registryAddress,
        resolverAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(createSubdomainInOpenDomainAndSetContentHashError).toBeUndefined();
    expect(createSubdomainInOpenDomainAndSetContentHashData).toBeDefined();

    const {
      data: getContentHashFromDomainData,
      error: getContentHashFromDomainError,
    } = await ownerClient.invoke({
      uri: ensUri,
      method: "getContentHashFromDomain",
      args: {
        domain: "label2." + openSubdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    expect(getContentHashFromDomainError).toBeUndefined();
    expect(getContentHashFromDomainData).toEqual(cid);
  });
});
