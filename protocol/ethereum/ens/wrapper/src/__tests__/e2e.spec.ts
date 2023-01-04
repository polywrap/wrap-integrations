import {
  providers as testEnvProviders,
  ensAddresses, buildWrapper
} from "@polywrap/test-env-js";
import { PolywrapClient } from "@polywrap/client-js";
import path from "path";
import { providers } from "ethers";

import { getConfig } from "./utils";
import { initInfra, stopInfra } from "./infra";

jest.setTimeout(900000);

describe("ENS Wrapper", () => {
  // We will have two clients because we need two
  // different signers in order to test ENS functions
  let ownerClient: PolywrapClient;
  let anotherOwnerClient: PolywrapClient;

  let fsUri: string;
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
    await initInfra();

    // deploy api
    const apiPath: string = path.resolve(__dirname + "/../../");
    await buildWrapper(apiPath);
    fsUri = `fs/${apiPath}/build`;

    // set up ethers provider
    ethersProvider = providers.getDefaultProvider(
      testEnvProviders.ethereum
    ) as providers.JsonRpcProvider;
    owner = (await ethersProvider.getSigner(0).getAddress()).toLowerCase();
    anotherOwner = (await ethersProvider.getSigner(1).getAddress()).toLowerCase();
    registryAddress = ensAddresses.ensAddress;
    registrarAddress = ensAddresses.registrarAddress;
    resolverAddress = ensAddresses.resolverAddress.toLowerCase();
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
    const config = getConfig(testEnvProviders.ethereum, ensAddresses.ensAddress, testEnvProviders.ipfs, uts46Uri, sha3Uri);
    ownerClient = new PolywrapClient(config, { noDefaults: true });

    const anotherOwnerConfig = getConfig(
      testEnvProviders.ethereum,
      ensAddresses.ensAddress,
      testEnvProviders.ipfs,
      uts46Uri,
      sha3Uri,
      anotherOwner
    );
    anotherOwnerClient = new PolywrapClient(anotherOwnerConfig, { noDefaults: true });
  });

  afterAll(async () => {
    await stopInfra();
  });

  it("should register domain", async () => {
    const result = await ownerClient.invoke<string>({
      uri: fsUri,
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

    if (result.ok === false) throw result.error;
    expect(result.value).toBeDefined();
  });

  it("should set and get resolver", async () => {
    const setResult = await ownerClient.invoke({
      uri: fsUri,
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

    if (setResult.ok === false) throw setResult.error;
    expect(setResult.value).toBeDefined();

    const getResult = await ownerClient.invoke({
      uri: fsUri,
      method: "getResolver",
      args: {
        domain: customTld,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    if (getResult.ok === false) throw getResult.error;
    expect(getResult.value).toEqual(resolverAddress);
  });

  it("should set owner of subdomain and fetch it", async () => {
    const subdomain = "bob." + customTld;

    const setResult = await ownerClient.invoke({
      uri: fsUri,
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

    if (setResult.ok === false) throw setResult.error;
    expect(setResult.value).toBeDefined();

    const getResult = await ownerClient.invoke({
      uri: fsUri,
      method: "getOwner",
      args: {
        domain: subdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    if (getResult.ok === false) throw getResult.error;
    expect(getResult.value).toBeDefined();
  });

  it("should register domain with subdomains recursively and fetch it", async () => {
    const domain = "foo.bar.baz.mydomain.eth";

    const registerDomainAndSubdomainsRecursivelyResult = await ownerClient.invoke<any[]>({
      uri: fsUri,
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

    if (registerDomainAndSubdomainsRecursivelyResult.ok === false) throw registerDomainAndSubdomainsRecursivelyResult.error;
    expect(registerDomainAndSubdomainsRecursivelyResult.value).toBeDefined();
    
    const resultingRegistrations = registerDomainAndSubdomainsRecursivelyResult.value;

    expect(resultingRegistrations[0]?.name).toBe("mydomain.eth")
    expect(resultingRegistrations[0]?.didRegister).toBe(true)
    expect(resultingRegistrations[1]?.name).toBe("baz.mydomain.eth")
    expect(resultingRegistrations[1]?.didRegister).toBe(true)
    expect(resultingRegistrations[2]?.name).toBe("bar.baz.mydomain.eth")
    expect(resultingRegistrations[2]?.didRegister).toBe(true)
    expect(resultingRegistrations[3]?.name).toBe("foo.bar.baz.mydomain.eth")
    expect(resultingRegistrations[3]?.didRegister).toBe(true)

    const getOwnerResult = await ownerClient.invoke({
      uri: fsUri,
      method: "getOwner",
      args: {
        domain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    if (getOwnerResult.ok === false) throw getOwnerResult.error;
    expect(getOwnerResult.value).toBeDefined();
    expect(getOwnerResult.value).toBe(owner);

    // No subdomain

    const domainWithNoSubdomain = "sumtin.eth";
  
    const domainWithNoSubdomainResult = await ownerClient.invoke<any[]>({
      uri: fsUri,
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

    if (domainWithNoSubdomainResult.ok === false) throw domainWithNoSubdomainResult.error;
    expect(domainWithNoSubdomainResult.value).toBeDefined();
    
    const domainWithNoSubdomainRegistrations = domainWithNoSubdomainResult.value;

    expect(domainWithNoSubdomainRegistrations[0]?.name).toBe("sumtin.eth")
  });

  it("should not attempt to re-register registered subdomains/domains when recursively registering", async () => {
    const rootDomain = "domain.eth"
    const label = "sub"
    const tld = `${label}.${rootDomain}`
    const subdomain = `already.registered.${tld}`;

    await ownerClient.invoke<string>({
      uri: fsUri,
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
      uri: fsUri,
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
      uri: fsUri,
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

    const registerDomainAndSubdomainsRecursivelyResult = await ownerClient.invoke<any[]>({
      uri: fsUri,
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

    if (registerDomainAndSubdomainsRecursivelyResult.ok === false) throw registerDomainAndSubdomainsRecursivelyResult.error;
    expect(registerDomainAndSubdomainsRecursivelyResult.value).toBeDefined();

    const resultingRegistrations = registerDomainAndSubdomainsRecursivelyResult.value;

    expect(resultingRegistrations[0]?.name).toBe("domain.eth")
    expect(resultingRegistrations[0]?.didRegister).toBe(false)
    expect(resultingRegistrations[1]?.name).toBe("sub.domain.eth")
    expect(resultingRegistrations[1]?.didRegister).toBe(false)
    expect(resultingRegistrations[2]?.name).toBe("registered.sub.domain.eth")
    expect(resultingRegistrations[2]?.didRegister).toBe(true)
    expect(resultingRegistrations[3]?.name).toBe("already.registered.sub.domain.eth")
    expect(resultingRegistrations[3]?.didRegister).toBe(true)

    const getOwnerResult = await ownerClient.invoke({
      uri: fsUri,
      method: "getOwner",
      args: {
        domain: subdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      },
    });

    if (getOwnerResult.ok === false) throw getOwnerResult.error;
    expect(getOwnerResult.value).toBeDefined();
    expect(getOwnerResult.value).toBe(owner);
  });

  it("should register subdomain recursively and fetch it", async () => {
    const tld = "basedomain.eth";
    const subdomain = `aaa.bbb.ccc.${tld}`;

    await ownerClient.invoke<string>({
      uri: fsUri,
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

    const registerSubdomainsRecursivelyResult = await ownerClient.invoke<any[]>({
      uri: fsUri,
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

    if (registerSubdomainsRecursivelyResult.ok === false) throw registerSubdomainsRecursivelyResult.error;
    expect(registerSubdomainsRecursivelyResult.value).toBeDefined();
    
    const resultingRegistrations = registerSubdomainsRecursivelyResult.value;

    expect(resultingRegistrations[0]?.name).toBe("ccc.basedomain.eth")
    expect(resultingRegistrations[0]?.didRegister).toBe(true)
    expect(resultingRegistrations[1]?.name).toBe("bbb.ccc.basedomain.eth")
    expect(resultingRegistrations[1]?.didRegister).toBe(true)
    expect(resultingRegistrations[2]?.name).toBe("aaa.bbb.ccc.basedomain.eth")
    expect(resultingRegistrations[2]?.didRegister).toBe(true)

    const getOwnerResult = await ownerClient.invoke({
      uri: fsUri,
      method: "getOwner",
      args: {
        domain: subdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    if (getOwnerResult.ok === false) throw getOwnerResult.error;
    expect(getOwnerResult.value).toBeDefined();
    expect(getOwnerResult.value).toBe(owner);
  });

  it("should set subdomain owner, resolver and ttl", async () => {
    const setSubdomainRecordResult = await ownerClient.invoke({
      uri: fsUri,
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

    if (setSubdomainRecordResult.ok === false) throw setSubdomainRecordResult.error;
    expect(setSubdomainRecordResult.value).toBeDefined();

    const getOwnerResult = await ownerClient.invoke({
      uri: fsUri,
      method: "getOwner",
      args: {
        domain: customSubdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    if (getOwnerResult.ok === false) throw getOwnerResult.error;
    expect(getOwnerResult.value).toEqual(anotherOwner);
  });

  it("should update and fetch owner", async () => {
    const getOldOwnerResult = await anotherOwnerClient.invoke({
      uri: fsUri,
      method: "getOwner",
      args: {
        domain: customSubdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    if (getOldOwnerResult.ok === false) throw getOldOwnerResult.error;
    expect(getOldOwnerResult.value).toEqual(anotherOwner);

    const setOwnerResult = await anotherOwnerClient.invoke({
      uri: fsUri,
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

    if (setOwnerResult.ok === false) throw setOwnerResult.error;
    expect(setOwnerResult.value).toBeDefined();

    const getNewOwnerResult = await ownerClient.invoke({
      uri: fsUri,
      method: "getOwner",
      args: {
        domain: customSubdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    if (getNewOwnerResult.ok === false) throw getNewOwnerResult.error;
    expect(getNewOwnerResult.value).toBe(owner);
  });

  it("should set content hash and fetch it", async () => {
    const cid = "0x64EC88CA00B268E5BA1A35678A1B5316D212F4F366B2477232534A8AECA37F3C".toLowerCase();

    const setContentHashResult = await ownerClient.invoke({
      uri: fsUri,
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

    if (setContentHashResult.ok === false) throw setContentHashResult.error;
    expect(setContentHashResult.value).toBeDefined();

    const getContentHashResult  = await ownerClient.invoke({
      uri: fsUri,
      method: "getContentHash",
      args: {
        domain: customSubdomain,
        resolverAddress,
        connection: {
          networkNameOrChainId: network
        }
      },
    });

    if (getContentHashResult.ok === false) throw getContentHashResult.error;
    expect(getContentHashResult.value).toEqual(cid);

    const getContentHashFromDomainResult = await ownerClient.invoke({
      uri: fsUri,
      method: "getContentHashFromDomain",
      args: {
        domain: customSubdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    if (getContentHashFromDomainResult.ok === false) throw getContentHashFromDomainResult.error;
    expect(getContentHashFromDomainResult.value).toEqual(cid);
  });

  it("should set address and fetch it", async () => {
    const setAddressResult = await ownerClient.invoke({
      uri: fsUri,
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

    if (setAddressResult.ok === false) throw setAddressResult.error;
    expect(setAddressResult.value).toBeDefined();

    const getAddressResult = await ownerClient.invoke({
      uri: fsUri,
      method: "getAddress",
      args: {
        domain: customTld,
        resolverAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    if (getAddressResult.ok === false) throw getAddressResult.error;
    expect(getAddressResult.value).toEqual(anotherOwner);

    const getAddressFromDomainResult = await ownerClient.invoke({
      uri: fsUri,
      method: "getAddressFromDomain",
      args: {
        domain: customTld,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    if (getAddressFromDomainResult.ok === false) throw getAddressFromDomainResult.error;
    expect(getAddressFromDomainResult.value).toEqual(anotherOwner);
  });

  it("should set reverse registry", async () => {
    const reverseRegistryResult = await ownerClient.invoke({
      uri: fsUri,
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

    if (reverseRegistryResult.ok === false) throw reverseRegistryResult.error;
    expect(reverseRegistryResult.value).toBeDefined();
  });

  it("should fetch name based on address from registry and resolver", async () => {
    const getNameFromAddressResult = await ownerClient.invoke({
      uri: fsUri,
      method: "getNameFromAddress",
      args: {
        address: owner,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    if (getNameFromAddressResult.ok === false) throw getNameFromAddressResult.error;
    expect(getNameFromAddressResult.value).toEqual(customTld);

    const getNameFromReverseResolverResult = await ownerClient.invoke({
      uri: fsUri,
      method: "getNameFromReverseResolver",
      args: {
        address: owner,
        resolverAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    if (getNameFromReverseResolverResult.ok === false) throw getNameFromReverseResolverResult.error;
    expect(getNameFromReverseResolverResult.value).toEqual(customTld);
  });

  it("should set and get text record from subdomain", async () => {
    const key = "snapshot";
    const value = "QmHash";

    const setTextRecordResult = await ownerClient.invoke({
      uri: fsUri,
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

    if (setTextRecordResult.ok === false) throw setTextRecordResult.error;
    expect(setTextRecordResult.value).toBeDefined();

    const getTextRecordResult = await ownerClient.invoke({
      uri: fsUri,
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

    if (getTextRecordResult.ok === false) throw getTextRecordResult.error;
    expect(getTextRecordResult.value).toEqual(value);
  });

  it("should configure open domain", async () => {
    const configureOpenDomainResult = await ownerClient.invoke<{
        fifsRegistrarAddress: string;
        setOwnerTxReceipt: any;
      }>({
      uri: fsUri,
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

    if (configureOpenDomainResult.ok === false) throw configureOpenDomainResult.error;
    expect(configureOpenDomainResult.value).toBeDefined();

    const getOwnerResult = await ownerClient.invoke({
      uri: fsUri,
      method: "getOwner",
      args: {
        domain: openSubdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    if (getOwnerResult.ok === false) throw getOwnerResult.error;
    expect(getOwnerResult.value).toEqual( configureOpenDomainResult.value.fifsRegistrarAddress);

    customFifsRegistrarAddress = configureOpenDomainResult.value.fifsRegistrarAddress;
  });

  it("should create subdomain in open domain", async () => {
    const result = await anotherOwnerClient.invoke({
      uri: fsUri,
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

    if (result.ok === false) throw result.error;
    expect(result.value).toBeDefined();
  });

  it("should create subdomain in open domain and set content hash", async () => {
    const cid = "0x64EC88CA00B268E5BA1A35678A1B5316D212F4F366B2477232534A8AECA37F3C".toLowerCase();

    const createAndSetResult = await anotherOwnerClient.invoke({
      uri: fsUri,
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

    if (createAndSetResult.ok === false) throw createAndSetResult.error;
    expect(createAndSetResult.value).toBeDefined();

    const getResult = await ownerClient.invoke({
      uri: fsUri,
      method: "getContentHashFromDomain",
      args: {
        domain: "label2." + openSubdomain,
        registryAddress,
        connection: {
          networkNameOrChainId: network
        }
      }
    });

    if (getResult.ok === false) throw getResult.error;
    expect(getResult.value).toEqual(cid);
  });
});
