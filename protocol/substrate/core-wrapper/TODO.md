# TODO:
- [ ] Make an example app, showcasing multiple functionalities of the substrate chain
    - [ ] balance transfer
    - [ ] storage api
        - [X] storage_value
        - [X] storage_maps
    - [ ] pallet constants
- [X] Deploy and use the substrate-polywrapper to ipfs
- [ ] Make the the extrinsic api:
        - execute_extrinsic
        - balance_transfer
    use only of the Public key instead of the the Pair, as it would be violating proper security practice.
    The payload/message should be signed by a different api calling on the signer and provider plugin of polywrap
- [ ] Make the module API take error into considerations
    - Right now, we are only returning `Option` instead of `Result` with proper error codes
