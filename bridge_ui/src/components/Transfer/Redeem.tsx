import {
  CHAIN_ID_AVAX,
  CHAIN_ID_BSC,
  CHAIN_ID_ETH,
  CHAIN_ID_ETHEREUM_ROPSTEN,
  CHAIN_ID_OASIS,
  CHAIN_ID_POLYGON,
  CHAIN_ID_SOLANA,
  CHAIN_ID_TERRA,
  isEVMChain,
  WSOL_ADDRESS,
  ChainId,
} from "@certusone/wormhole-sdk";
import {
  Checkbox,
  FormControlLabel,
  Link,
  makeStyles,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { parseUnits } from "ethers/lib/utils";
import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useGetIsTransferCompleted from "../../hooks/useGetIsTransferCompleted";
import { useHandleRedeem } from "../../hooks/useHandleRedeem";
import useIsWalletReady from "../../hooks/useIsWalletReady";
import {
  selectTransferIsRecovery,
  selectTransferTargetAsset,
  selectTransferTargetChain,
  selectTransferAmount,
  selectTransferSourceParsedTokenAccount,
} from "../../store/selectors";
import { reset } from "../../store/transferSlice";
import {
  getHowToAddTokensToWalletUrl,
  ROPSTEN_WETH_ADDRESS,
  WAVAX_ADDRESS,
  WBNB_ADDRESS,
  WETH_ADDRESS,
  WMATIC_ADDRESS,
  WROSE_ADDRESS,
  RELAYER_SUPPORTED_ADDRESSES_AND_THRESHOLDS,
} from "../../utils/consts";
import ButtonWithLoader from "../ButtonWithLoader";
import KeyAndBalance from "../KeyAndBalance";
import SmartAddress from "../SmartAddress";
import { SolanaCreateAssociatedAddressAlternate } from "../SolanaCreateAssociatedAddress";
import SolanaTPSWarning from "../SolanaTPSWarning";
import StepDescription from "../StepDescription";
import TerraFeeDenomPicker from "../TerraFeeDenomPicker";
import AddToMetamask from "./AddToMetamask";
import WaitingForWalletMessage from "./WaitingForWalletMessage";

const useStyles = makeStyles((theme) => ({
  alert: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

const shouldRelay = (chainId: ChainId, address: string | null | undefined, amount: bigint | false | "") => {
  const supported = RELAYER_SUPPORTED_ADDRESSES_AND_THRESHOLDS[chainId] as any;
  if (!supported || !address || !amount) return false;

  const minTransfer = supported[address];

  console.log('relay: ', { address, amount })

  return true;    // TODO: remove it in prod
  return !!minTransfer && amount >= minTransfer;
};

function Redeem() {
  const { handleClick, handleNativeClick, disabled, showLoader, handleRelayerRedeemClick } =
    useHandleRedeem();
  const targetChain = useSelector(selectTransferTargetChain);
  const targetAsset = useSelector(selectTransferTargetAsset);
  const isRecovery = useSelector(selectTransferIsRecovery);
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
  const { isTransferCompletedLoading, isTransferCompleted } =
    useGetIsTransferCompleted(true);
  const classes = useStyles();
  const dispatch = useDispatch();
  const { isReady, statusMessage } = useIsWalletReady(targetChain);
  //TODO better check, probably involving a hook & the VAA
  const isEthNative =
    targetChain === CHAIN_ID_ETH &&
    targetAsset &&
    targetAsset.toLowerCase() === WETH_ADDRESS.toLowerCase();
  const isEthRopstenNative =
    targetChain === CHAIN_ID_ETHEREUM_ROPSTEN &&
    targetAsset &&
    targetAsset.toLowerCase() === ROPSTEN_WETH_ADDRESS.toLowerCase();
  const isBscNative =
    targetChain === CHAIN_ID_BSC &&
    targetAsset &&
    targetAsset.toLowerCase() === WBNB_ADDRESS.toLowerCase();
  const isPolygonNative =
    targetChain === CHAIN_ID_POLYGON &&
    targetAsset &&
    targetAsset.toLowerCase() === WMATIC_ADDRESS.toLowerCase();
  const isAvaxNative =
    targetChain === CHAIN_ID_AVAX &&
    targetAsset &&
    targetAsset.toLowerCase() === WAVAX_ADDRESS.toLowerCase();
  const isOasisNative =
    targetChain === CHAIN_ID_OASIS &&
    targetAsset &&
    targetAsset.toLowerCase() === WROSE_ADDRESS.toLowerCase();
  const isSolNative =
    targetChain === CHAIN_ID_SOLANA &&
    targetAsset &&
    targetAsset === WSOL_ADDRESS;
  const isNativeEligible =
    isEthNative ||
    isEthRopstenNative ||
    isBscNative ||
    isPolygonNative ||
    isAvaxNative ||
    isOasisNative ||
    isSolNative;
  const [useNativeRedeem, setUseNativeRedeem] = useState(true);
  const toggleNativeRedeem = useCallback(() => {
    setUseNativeRedeem(!useNativeRedeem);
  }, [useNativeRedeem]);
  const handleResetClick = useCallback(() => {
    dispatch(reset());
  }, [dispatch]);
  const howToAddTokensUrl = getHowToAddTokensToWalletUrl(targetChain);
  const _shouldRelay = useMemo(() => (
    shouldRelay(targetChain, targetAsset, sourceAmountParsed)
  ), [targetChain, targetAsset, sourceAmountParsed]);

  return (
    <>
      <StepDescription>Receive the tokens on the target chain</StepDescription>
      <KeyAndBalance chainId={targetChain} />
      {targetChain === CHAIN_ID_TERRA && (
        <TerraFeeDenomPicker disabled={disabled} />
      )}
      {isNativeEligible && (
        <FormControlLabel
          control={
            <Checkbox
              checked={useNativeRedeem}
              onChange={toggleNativeRedeem}
              color="primary"
            />
          }
          label="Automatically unwrap to native currency"
        />
      )}
      {targetChain === CHAIN_ID_SOLANA && <SolanaTPSWarning />}
      {targetChain === CHAIN_ID_SOLANA ? (
        <SolanaCreateAssociatedAddressAlternate />
      ) : null}

      <ButtonWithLoader
        //TODO disable when the associated token account is confirmed to not exist
        disabled={
          !isReady ||
          disabled ||
          (isRecovery && (isTransferCompletedLoading || isTransferCompleted))
        }
        onClick={
          _shouldRelay
            ? handleRelayerRedeemClick
            : isNativeEligible && useNativeRedeem
              ? handleNativeClick
              : handleClick
        }
        showLoader={showLoader || (isRecovery && isTransferCompletedLoading)}
        error={statusMessage}
      >
        { `Redeem ${ _shouldRelay ? '(Acala pays gas for you 🎉)' : '' }` }
      </ButtonWithLoader>

      { !_shouldRelay && <WaitingForWalletMessage /> }

      {isRecovery && isReady && isTransferCompleted ? (
        <>
          <Alert severity="info" variant="outlined" className={classes.alert}>
            These tokens have already been redeemed.{" "}
            {!isEVMChain(targetChain) && howToAddTokensUrl ? (
              <Link
                href={howToAddTokensUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Click here to see how to add them to your wallet.
              </Link>
            ) : null}
          </Alert>
          {targetAsset ? (
            <>
              <span>Token Address:</span>
              <SmartAddress
                chainId={targetChain}
                address={targetAsset || undefined}
              />
            </>
          ) : null}
          {isEVMChain(targetChain) ? <AddToMetamask /> : null}
          <ButtonWithLoader onClick={handleResetClick}>
            Transfer More Tokens!
          </ButtonWithLoader>
        </>
      ) : null}
    </>
  );
}

export default Redeem;
