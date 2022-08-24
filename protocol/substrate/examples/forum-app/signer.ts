import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';

export class SignerProvider {

    async sign_payload(payload){
      const injectedPromise = await web3Enable('forum-app');
        console.log("injected promise:", injectedPromise);
        let accounts = await web3Accounts();
        console.log("accounts: ", accounts);


        // `account` is of type InjectedAccountWithMeta 
        // We arbitrarily select the first account returned from the above snippet
        const account = accounts[1];
        console.log("account:", account)

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

            return signature;
        }
    }
}

window.SignerProvider = SignerProvider;
