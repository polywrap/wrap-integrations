import { tezosDomainsPlugin } from "..";
import * as Types from "../w3";
import { generateRandomNumber } from "../utils";
import { FundraiserAccount, SecretAccount, DomainInfo } from "../types"
import { env } from "../env" 

import { Web3ApiClient } from "@web3api/client-js";
import { InMemorySigner } from "@taquito/signer";

jest.setTimeout(360000)

describe("Tezos Domains Plugin", () => {
  let client: Web3ApiClient;
  let uri: string;
  let domain: DomainInfo;
  let secretAccount: SecretAccount;
  let fundraiserAccount: FundraiserAccount;

  beforeAll(async () => {
    uri = "w3://ens/tezos-domains.web3api.eth"
    domain = env.domain
    secretAccount = env.accounts.secret[0]
    fundraiserAccount = env.accounts.fundraiser[0]

    client = new Web3ApiClient({
      plugins: [
        {
          uri,
          plugin: tezosDomainsPlugin({
            connections: {
              granadanet: {
                provider: "https://rpc.granada.tzstats.com",
                signer: InMemorySigner.fromFundraiser(fundraiserAccount.email, fundraiserAccount.password, fundraiserAccount.mnemonic.join(" "))
              },
              hangzhounet: {
                provider: "https://rpc.hangzhou.tzstats.com",
                signer: InMemorySigner.fromFundraiser(fundraiserAccount.email, fundraiserAccount.password, fundraiserAccount.mnemonic.join(" "))
              },
            },
            defaultNetwork: "hangzhounet"
          }),
        },
      ],
    });
  });

  describe("Query", () => {
    describe("resolveDomain", () => {
      it("throws an error when given an invalid address", async () => {
        const domain = "name.eth"
        const response = await client.query<{ resolveDomain: string }>({
          uri,
          query: `
            query {
              resolveDomain(domain: "${domain}" )
            }`
        })

        expect(response.errors).toBeDefined()
        expect(response.data?.resolveDomain).toBeUndefined()
        expect(response.errors?.length).toBe(1)
        expect(response.errors?.[0].message).toContain('is not a valid domain name')
      })

      it("resolves a valid a address", async () => {
        const response = await client.query<{ resolveDomain: string }>({
          uri,
          query: `
            query {
              resolveDomain(domain: "${domain.name}")
            }
          `
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.resolveDomain).toBeDefined()
        expect(response.data?.resolveDomain).toBe(domain.address)
      })
    })

    describe("resolveAddressToDomain", () => {
      it("resolves an address to a domain", async () => {
        const response = await client.query<{ resolveAddressToDomain: string }>({
          uri,
          query: `
            query {
              resolveAddressToDomain(address: "${domain.address}")
            }
          `
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.resolveAddressToDomain).toBe(domain.name)
      })

      it("throws an error when address is invalid", async () => {
        const response = await client.query<{ resolvedAddressToDomain: string }>({
          uri,
          query: `
            query {
              resolveAddressToDomain(address: "xxcxcksdslslslinvalidaddress")
            }
          `
        })

        expect(response.errors).toBeDefined()
        expect(response.data?.resolvedAddressToDomain).toBeUndefined()
        expect(response.errors?.length).toBe(1)
        expect(response.errors?.[0].message).toContain('Address is not valid')
      })
    })

    describe("resolveDomainRecords", () => {
      it("throws an error when domain is invalid", async () => {
        const response = await client.query<{ resolveDomainRecords: Types.DomainRecords }>({
          uri,
          query: `
            query {
              resolveDomainRecords(domain: "${domain.address}")
            }
          `
        })
  
        expect(response.errors).toBeDefined()
        expect(response.data?.resolveDomainRecords).toBeUndefined()
        expect(response.errors?.length).toBe(1)
        expect(response.errors?.[0].message).toContain('is not a valid domain name')
      })

      it("resolves the records of a domain name", async () => {
        const response = await client.query<{ resolveDomainRecords: Types.DomainRecords }>({
          uri,
          query: `
            query {
              resolveDomainRecords(domain: "${domain.name}")
            }
          `
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.resolveDomainRecords).toBeDefined()
        expect(response.data?.resolveDomainRecords.address).toBe(domain.address)
        expect(response.data?.resolveDomainRecords.name).toBe(domain.name)
        expect(response.data?.resolveDomainRecords.data).toBeDefined()
        expect(response.data?.resolveDomainRecords.name).toBe(domain.name)
        expect(response.data?.resolveDomainRecords.address).toBe(domain.address)
        expect(response.data?.resolveDomainRecords.expiry).toBeDefined()
      })
    })

    describe("getSupportedTlds", () => {
      it("returns all supported tlds", async () => {
        const response = await client.query<{ getSupportedTlds: string[] }>({
          uri,
          query: `
            query {
              getSupportedTlds
            }
          `
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.getSupportedTlds.length).toBe(4)
        expect(response.data?.getSupportedTlds).toEqual(["han", "a1", "a2", "a3"])
      })
    })

    describe("getAcquisitionInfo", () => {
      it("returns the acquisition state of the domain name", async () => {
        const response  = await client.query<{ getAcquisitionInfo: Types.AcquisitionInfo }>({
          uri,
          query: `
            query {
              getAcquisitionInfo(domain: "${domain.name}", duration: ${2})
            }
          `
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.getAcquisitionInfo.state).toBe("Taken")
        expect(response.data?.getAcquisitionInfo.cost).toBeDefined()
      })
    })
  })

  describe("Mutation", () => {
    describe("setSignerWithSecretKeyParams", () => {
      it("returns false if secret key is empty", async () => {
        let client = new Web3ApiClient({
          plugins: [
            {
              uri,
              plugin: tezosDomainsPlugin({
                connections: {
                  granadanet: {
                    provider: "https://rpc.granada.tzstats.com",
                  } 
                },
                defaultNetwork: "granadanet"
              }),
            },
          ],
        });
  
        const response = await client.query<{ setSignerWithSecretKeyParams: Types.Result }>({
          uri,
          query: `
            mutation {
              setSignerWithSecretKeyParams(
                params: { key: "" }
              )
          }`,
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.setSignerWithSecretKeyParams.error).toBeDefined()
        expect(response.data?.setSignerWithSecretKeyParams.status).toBe(false)
      })

      it("fails if secret key is invalid", async () => {
        let client = new Web3ApiClient({
          plugins: [
            {
              uri,
              plugin: tezosDomainsPlugin({
                connections: {
                  granadanet: {
                    provider: "https://rpc.granada.tzstats.com",
                  } 
                },
                defaultNetwork: "granadanet"
              }),
            },
          ],
        });
  
        const response = await client.query<{ setSignerWithSecretKeyParams: Types.Result }>({
          uri,
          query: `
            mutation {
              setSignerWithSecretKeyParams(
                params: { key: "invalid-secret-key" }
              )
          }`,
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.setSignerWithSecretKeyParams.error).toBeDefined()
        expect(response.data?.setSignerWithSecretKeyParams.status).toBe(false)
      })

      it("set signer using secret key", async () => {
        const params: Types.SecretKeyParams = {
          key: secretAccount.secretKey,
        }

        let client = new Web3ApiClient({
          plugins: [
            {
              uri,
              plugin: tezosDomainsPlugin({
                connections: {
                  granadanet: {
                    provider: "https://rpc.granada.tzstats.com",
                  } 
                },
                defaultNetwork: "granadanet"
              }),
            },
          ],
        });
  
        const response = await client.query<{ setSignerWithSecretKeyParams: Types.Result }>({
          uri,
          query: `
            mutation {
              setSignerWithSecretKeyParams(params: $params)
            }
          `,
          variables: {
            params
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.setSignerWithSecretKeyParams.error).toBeUndefined()
        expect(response.data?.setSignerWithSecretKeyParams.status).toBe(true)
      })
    })

    describe("setSignerWithFundraiserParams", () => {
      it("set signer using faucet key", async () => {
        const params: Types.FundraiserParams = {
          email: fundraiserAccount.email,
          password: fundraiserAccount.password,
          mnemonic: fundraiserAccount.mnemonic.join(" ")
        }
        let client = new Web3ApiClient({
          plugins: [
            {
              uri,
              plugin: tezosDomainsPlugin({
                connections: {
                  granadanet: {
                    provider: "https://rpc.granada.tzstats.com",
                  } 
                },
                defaultNetwork: "granadanet"
              }),
            },
          ],
        });
  
        const response = await client.query<{ setSignerWithFundraiserParams: Types.Result }>({
          uri,
          query: `
            mutation {
              setSignerWithFundraiserParams(
                params: $params
              )
          }`,
          variables: {
            params
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.setSignerWithFundraiserParams.error).toBeUndefined()
        expect(response.data?.setSignerWithFundraiserParams.status).toBe(true)
      })
    })

    describe("buyDomain", () => {
      it("fails to buy an already taken domain", async () => {
        const response = await client.query<{ buyDomain: Types.Result }>({
          uri,
          query: `
            mutation {
              buyDomain(
                domain: "${domain.name}",
                duration: $duration,
                owner: "${domain.address}",
                confirmation: $confirmation
              )
            }
          `,
          variables: {
            duration: 1,
            confirmation: 1
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.buyDomain.error).toContain('is already taken')
      })

      it("fails to buy a domain name with invalid tld", async () => {
        const response = await client.query<{ buyDomain: Types.Result }>({
          uri,
          query: `
            mutation {
              buyDomain(
                domain: "random.gibberish012",
                duration: $duration,
                owner: "${domain.address}",
                confirmation: $confirmation
              )
            }
          `,
          variables: {
            duration: 1,
            confirmation: 1
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.buyDomain.error).toContain("Domain TLD: 'gibberish012' is not valid")
      })

      it("buys a domain", async () => {
        const response = await client.query<{ buyDomain: Types.Result }>({
          uri,
          query: `
            mutation {
              buyDomain(
                domain: "random-address-${generateRandomNumber()}.a1",
                duration: $duration,
                owner: "${fundraiserAccount.pkh}",
                confirmation: $confirmation
              )
            }
          `,
          variables: {
            duration: 1,
            confirmation: 3
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.buyDomain.status).toBe(true)
      })
    })

    describe("createSubDomain", () => {
      it("creates a subdomain for domain", async () => {     
        let client = new Web3ApiClient({
          plugins: [
            {
              uri,
              plugin: tezosDomainsPlugin({
                connections: {
                  hangzhounet: {
                    provider: "https://rpc.hangzhou.tzstats.com",
                    signer: InMemorySigner.fromFundraiser(domain.fundraiser.email, domain.fundraiser.password, domain.fundraiser.mnemonic.join(" "))
                  },
                },
                defaultNetwork: "hangzhounet"
              }),
            },
          ],
        });

        const subdomain = `sub-${generateRandomNumber()}`
        const response = await client.query<{ createSubDomain: Types.Result }>({
          uri,
          query: `
            mutation {
              createSubDomain(
                domain: $domain,
                subdomain: $subdomain,
                owner: $owner,
                confirmation: 3
              )
            }
          `,
          variables: {
            subdomain,
            domain: domain.name,
            owner: domain.address
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.createSubDomain).toBeDefined()
        expect(response.data?.createSubDomain.error).toBeUndefined()
        expect(response.data?.createSubDomain.status).toBe(true)
      })

      it("fails to create a subdomain if domain is not owned by the address", async () => {
        const subdomain = `sub-${generateRandomNumber()}`
        const response = await client.query<{ createSubDomain: Types.Result }>({
          uri,
          query: `
            mutation {
              createSubDomain(
                domain: $domain,
                subdomain: $subdomain,
                owner: $owner,
                confirmation: 3
              )
            }
          `,
          variables: {
            subdomain,
            domain: domain.name,
            owner: fundraiserAccount.pkh
          }
        })

        expect(response.errors).toBeDefined()
        expect(response.data?.createSubDomain).toBeUndefined()
        expect(response.errors?.length).toBeGreaterThanOrEqual(1)
        expect(response.errors?.[0].message).toContain('NOT_AUTHORIZED')
      })
    })

    describe("updateDomainRecord", () => {
      it("updates the record for a domain", async () => {
        let client = new Web3ApiClient({
          plugins: [
            {
              uri,
              plugin: tezosDomainsPlugin({
                connections: {
                  hangzhounet: {
                    provider: "https://rpc.hangzhou.tzstats.com",
                    signer: InMemorySigner.fromFundraiser(domain.fundraiser.email, domain.fundraiser.password, domain.fundraiser.mnemonic.join(" "))
                  },
                },
                defaultNetwork: "hangzhounet"
              }),
            },
          ],
        });

        const response = await client.query<{ updateDomainRecord: Types.Result }>({
          uri,
          query: `
            mutation {
              updateDomainRecord(
                domain: $domain,
                owner: $owner,
                address: $owner,
                records: $records,
                confirmation: 3
              )
            }
          `,
          variables: {
            domain: domain.name,
            owner: domain.address,
            records: {
              'openid:name': 'jackie gamil'
            }
          }
        })

        expect(response.errors).toBeUndefined()
        expect(response.data?.updateDomainRecord.status).toBe(true)
        expect(response.data?.updateDomainRecord.error).toBeUndefined()
      })

      it("fails to update the records for a domain not owned by the address", async () => {
        const response = await client.query<{ updateDomainRecord: Types.Result }>({
          uri,
          query: `
            mutation {
              updateDomainRecord(
                domain: $domain,
                owner: $owner,
                records: $records,
                confirmation: 3
              )
            }
          `,
          variables: {
            domain: domain.name,
            owner: secretAccount.address,
            records: '{"openid:name":"jackie gamil"}'
          }
        })

        expect(response.errors).toBeDefined()
        expect(response.data?.updateDomainRecord).toBeUndefined()
        expect(response.errors?.length).toBeGreaterThanOrEqual(1)
        expect(response.errors?.[0].message).toContain('NOT_AUTHORIZED')
      })
    })
  })
});
