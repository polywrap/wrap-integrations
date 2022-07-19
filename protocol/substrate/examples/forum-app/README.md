# A forum app example implemented on top of substrate blockchain using polywrap

## Prerequisite
Make sure the following are installed
- rust
- docker
- node
- yarn


## Background services
Run the custom substrate-node-template with forum pallet added
- `cd ../substrate-node-template && cargo run --release -- --dev`
Run the ipfs infrastructure
- `cd ../core-wrapper && yarn infra`

## Compile and run
```
yarn && yarn start
```
