# Wormhole bridge - ETH (Acala test version)
## run
- install dependencies
```
yarn
```

- build contracts
```
yarn build
```

- deploy contracts
```
yarn migrate
yarn migrate:pub
```

- run tests
```
yarn test
yarn test:pub
```

## gas price / gas limit
If we want to change gas price or gas limit, we need to manually calculate the eth params like this, and put them into the config.
```ts
import { calcEthereumTransactionParams } from '@acala-network/eth-providers';

const TX_FEE_PER_GAS = '199999946752';
const STORAGE_BYTE_DEPOSIT = '100000000000000';

const { txGasPrice, txGasLimit } = calcEthereumTransactionParams({
  gasLimit: '10000000',
  validUntil: '360001',
  storageLimit: '64001',
  txFeePerGas: TX_FEE_PER_GAS,
  storageByteDeposit: STORAGE_BYTE_DEPOSIT,
});

// in this example, we will get:
// txGasPrice = 200786445289 
// txGasLimit = 42032000
```

## \#\#\#\#\# below are original README \#\#\#\#\#

These smart contracts allow to use Ethereum as foreign chain in the Wormhole protocol.

The `Wormhole` contract is the bridge contract and allows tokens to be transferred out of ETH and VAAs to be submitted
to transfer tokens in or change configuration settings.

The `WrappedAsset` is a ERC-20 token contract that holds metadata about a wormhole asset on ETH. Wormhole assets are all
wrapped non-ETH assets that are currently held on ETH.

### Deploying

To deploy the bridge on Ethereum you first need to compile all smart contracts:
`npx truffle compile`

To deploy you can either use the bytecode from the `build/contracts` folder or the oz cli `oz deploy <Contract>` 
([Documentation](https://docs.openzeppelin.com/learn/deploying-and-interacting)).

You first need to deploy one `Wrapped Asset` and initialize it using dummy data.

Then deploy the `Wormhole` using the initial guardian key (`key_x,y_parity,0`) and the address of the previously deployed
`WrappedAsset`. The wrapped asset contract will be used as proxy library to all the creation of cheap proxy wrapped 
assets.

### Testing

For each test run:

Run `npx ganache-cli --deterministic --time "1970-01-01T00:00:00+00:00"` to start a chain.

Run the tests using `npm run test`

### User methods

`submitVAA(bytes vaa)` can be used to execute a VAA.

`lockAssets(address asset, uint256 amount, bytes32 recipient, uint8 target_chain)` can be used
to transfer any ERC20 compliant asset out of ETH to any recipient on another chain that is connected to the Wormhole
protocol. `asset` is the asset to be transferred, `amount` is the amount to transfer (this must be <= the allowance that
you have previously given to the bridge smart contract if the token is not a wormhole token), `recipient` is the foreign
chain address of the recipient, `target_chain` is the id of the chain to transfer to.

`lockETH(bytes32 recipient, uint8 target_chain)` is a convenience function to wrap the Ether sent with the function call
and transfer it as described in `lockAssets`.
