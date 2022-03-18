import { useMemo } from "react";
import { useSelector } from "react-redux";
import { ChainId } from "@certusone/wormhole-sdk";
import { parseUnits } from "ethers/lib/utils";
import { RELAYER_SUPPORTED_ADDRESSES_AND_THRESHOLDS } from "../utils/consts";
import {
  selectTransferTargetChain,
  selectTransferAmount,
  selectTransferSourceParsedTokenAccount,
  selectTransferSourceAsset,
} from "../store/selectors";

const shouldRelay = (chainId: ChainId, address: string | null | undefined, amount: bigint | false | "") => {
  const supported = RELAYER_SUPPORTED_ADDRESSES_AND_THRESHOLDS[chainId] as any;
  if (!supported || !address || !amount) return false;

  const minTransfer = supported[address.toLowerCase()];
  const res = !!minTransfer && amount >= BigInt(minTransfer);

  console.log('check should relay: ', { chainId, address, amount, res })

  return res;
};

export const useShouldRelay = (): boolean => {
  const targetChain = useSelector(selectTransferTargetChain);
  const sourceAsset = useSelector(selectTransferSourceAsset);
  const sourceAmount = useSelector(selectTransferAmount);
  const sourceParsedTokenAccount = useSelector(
    selectTransferSourceParsedTokenAccount
  );
  const sourceDecimals = sourceParsedTokenAccount?.decimals;
  const sourceAmountParsed =
    sourceDecimals !== undefined &&
    sourceDecimals !== null &&
    sourceAmount &&
    parseUnits(sourceAmount, sourceDecimals).toBigInt();

  return useMemo(() => (
    shouldRelay(targetChain, sourceAsset, sourceAmountParsed)
  ), [targetChain, sourceAsset, sourceAmountParsed]);
};