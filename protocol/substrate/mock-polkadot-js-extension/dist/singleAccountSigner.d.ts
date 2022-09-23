import type { Signer, SignerResult } from '@polkadot/api/types';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { Registry, SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
export declare class SingleAccountSigner implements Signer {
    #private;
    constructor(registry: Registry, keyringPair: KeyringPair, signDelay?: number);
    signPayload(payload: SignerPayloadJSON): Promise<SignerResult>;
    signRaw({ address, data }: SignerPayloadRaw): Promise<SignerResult>;
}
