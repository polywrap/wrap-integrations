import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
//import { signatureVerify } from '@polkadot/util-crypto'
const { signatureVerify } = require('@polkadot/util-crypto');

export class SignerProvider {

    async signer_accounts(){
        let accounts = await web3Accounts();
        console.log("accounts: ", accounts);
    }

    async sign_payload(payload){
      const injectedPromise = await web3Enable('forum-app');
        let accounts = await web3Accounts();


        // `account` is of type InjectedAccountWithMeta 
        // We arbitrarily select the first account returned from the above snippet
        const account = accounts[0];

        // to be able to retrieve the signer interface from this account
        // we can use web3FromSource which will return an InjectedExtension type
        const injector = await web3FromSource(account.meta.source);

        // this injector object has a signer and a signRaw method
        // to be able to sign raw bytes
        const signRaw = injector?.signer?.signRaw;

        if (!!signRaw) {
            // after making sure that signRaw is defined
            // we can use it to sign our message
            const { signature } = await signRaw({
                address: account.address,
                data: payload,
                type: 'bytes'
            });

            console.log("js argument payload:", payload);
            console.error("js argument signature: ", signature);
            console.log("js argument account address:", account.address);
            const isValid = signatureVerify(payload, signature, account.address);
            console.log("js signature valid ", isValid);

            return signature;
        }
    }
}

window.SignerProvider = SignerProvider;
