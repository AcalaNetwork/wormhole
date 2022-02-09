import {
  CHAIN_ID_KARURA,
  hexToUint8Array,
  redeemOnEth,
  redeemOnEthNative,
} from "@certusone/wormhole-sdk";
import { ethers } from "ethers";
import { ChainConfigInfo } from "../configureEnv";
import { EvmRpcProvider } from '@acala-network/eth-providers';

export async function relayEVM(
  chainConfigInfo: ChainConfigInfo,
  signedVAA: string,
  unwrapNative: boolean,
  request: any,
  response: any
) {
  let provider;
  if (chainConfigInfo.chainId === CHAIN_ID_KARURA) {
    const KARURA_ENDPOINT_URL ='ws://188.166.208.240:9944';
    provider = EvmRpcProvider.from(KARURA_ENDPOINT_URL);
    await provider.isReady();
  } else {
    provider = new ethers.providers.WebSocketProvider(chainConfigInfo.nodeUrl);
  }

  const signer = new ethers.Wallet(chainConfigInfo.walletPrivateKey, provider);
  const receipt = unwrapNative
    ? await redeemOnEthNative(
        chainConfigInfo.tokenBridgeAddress,
        signer,
        hexToUint8Array(signedVAA)
      )
    : await redeemOnEth(
        chainConfigInfo.tokenBridgeAddress,
        signer,
        hexToUint8Array(signedVAA)
      );
  provider.destroy();
  console.log("successfully redeemed on evm", receipt);
  response.status(200).json(receipt);
}
