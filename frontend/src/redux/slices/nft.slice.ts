import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../store';
import { HttpStatusCode } from 'axios';
import { ActionCreatorOptions } from '../../types/redux/store.types';
import { NftSliceState } from 'types/redux/nft.types';
import axios from 'axios';
import { Connection, SendOptions, Transaction } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

const initialState: NftSliceState = {
  nft: null,
  errors: {
    fetchNft: null,
  },
};

const nftSlice = createSlice({
  name: 'nft',
  initialState,
  reducers: {
    setNft: (state, action: PayloadAction<string | null>) => {
      state.nft = action.payload;
    },
    setNftError: (state, action: PayloadAction<NftSliceState['errors']>) => {
      state.errors = { ...state.errors, ...action.payload };
    },
  },
});

export const fetchInvestorNft =
  (investorAddress: string, projectName: string, options?: ActionCreatorOptions) =>
  async (dispatch: AppDispatch) => {
    dispatch(setNftError({ fetchNft: null }));

    try {
      const BASE_URL = `${import.meta.env.VITE_BACKEND_URI}`;
      const response = await axios.get(
        `${BASE_URL}/nft-for-vesting/${investorAddress}/${projectName}`,
        {},
      );

      if (response.status === HttpStatusCode.Ok) {
        options?.onSuccess?.(response.data);
        return dispatch(setNft(response.data.nftMintAddress));
      }
    } catch (error) {
      options?.onError?.(error);
      dispatch(
        setNftError({
          fetchNft: 'Error during getting NFT for investor. Check address or try again.',
        }),
      );
    }
  };
export const startVesting =
  (
    investorAddress: string,
    projectId: string,
    wallet: WalletContextState,
    connection: Connection,
    options?: ActionCreatorOptions,
  ) =>
  async (dispatch: AppDispatch) => {
    dispatch(setNftError({ fetchNft: null }));
    if (!wallet.connected || !wallet.publicKey) {
      console.error('Wallet not connected');
      dispatch(setNftError({ fetchNft: 'Wallet is connected' }));
      return;
    }
    if (!wallet.signTransaction) {
      const error = new Error("Wallet can't sign the transaction.");
      console.error(error.message);
      dispatch(setNftError({ fetchNft: error.message }));
      options?.onError?.(error);
      return;
    }

    try {
      console.log(
        `[Frontend] Calling backend to prepare vesting transaction for project ${projectId}, investor ${investorAddress}`,
      );
      const BASE_URL = `${import.meta.env.VITE_BACKEND_URI}`;
      const response = await axios.post<{ serializedTransaction: string }>(
        `${BASE_URL}/projects/initiate-burn-and-vesting`,

        { projectId: projectId, investorAddress: investorAddress },
      );

      if (response.status === HttpStatusCode.Ok && response.data.serializedTransaction) {
        const serializedTx = response.data.serializedTransaction;
        console.log('[Frontend] Received serialized transaction from backend.');

        const transaction = Transaction.from(Buffer.from(serializedTx, 'base64'));
        console.log('[Frontend] Transaction deserialized.');

        if (!transaction.feePayer?.equals(wallet.publicKey)) {
          console.warn(
            '[Frontend] Fee payer in the transaction does not match the connected wallet. This might be unexpected.',
            'Expected:',
            wallet.publicKey.toBase58(),
            'Got:',
            transaction.feePayer?.toBase58(),
          );
        }

        console.log('[Frontend] Requesting signature from wallet...');
        const signedTransaction = await wallet.signTransaction(transaction);
        console.log('[Frontend] Transaction signed by wallet.');

        console.log('[Frontend] Sending fully signed transaction to Solana network...');
        const sendOptions: SendOptions = { skipPreflight: false };
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
          sendOptions,
        );
        console.log('[Frontend] Transaction submitted. Signature:', signature);

        console.log('[Frontend] Confirming transaction...');
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash('confirmed');
        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash,
            lastValidBlockHeight,
          },
          'confirmed',
        );

        if (confirmation.value.err) {
          console.error('[Frontend] Transaction confirmation failed:', confirmation.value.err);
          throw new Error(`Помилка підтвердження транзакції: ${confirmation.value.err}`);
        }

        console.log('[Frontend] Transaction successfully confirmed!');
        options?.onSuccess?.({ signature });
      } else {
        const backendError =
          (response.data as any)?.error || 'Не вдалося отримати транзакцію з бекенду.';
        console.error(
          '[Frontend] Backend response error:',
          backendError,
          'Status:',
          response.status,
        );
        throw new Error(backendError);
      }
    } catch (error: any) {
      console.error('[Frontend] Error in startVesting process:', error);
      dispatch(setNftError({ fetchNft: error }));
      options?.onError?.(error);
    }
  };

export const startVestingForStartup =
  (
    beneficiaryAddress: string,
    projectId: string,
    wallet: WalletContextState,
    connection: Connection,
    options?: ActionCreatorOptions,
  ) =>
  async (dispatch: AppDispatch) => {
    dispatch(setNftError({ fetchNft: null }));
    if (!wallet.connected || !wallet.publicKey) {
      console.error('Wallet not connected');
      dispatch(setNftError({ fetchNft: 'Wallet is connected' }));
      return;
    }
    if (!wallet.signTransaction) {
      const error = new Error("Wallet can't sign the transaction.");
      console.error(error.message);
      dispatch(setNftError({ fetchNft: error.message }));
      options?.onError?.(error);
      return;
    }

    try {
      console.log(
        `[Frontend] Calling backend to prepare vesting transaction for project ${projectId}, investor ${beneficiaryAddress}`,
      );
      const BASE_URL = `${import.meta.env.VITE_BACKEND_URI}`;
      const response = await axios.post<{ serializedTransaction: string }>(
        `${BASE_URL}/projects/initiate-vesting`,

        { projectId: projectId, beneficiaryAddress: beneficiaryAddress },
      );

      if (response.status === HttpStatusCode.Ok && response.data.serializedTransaction) {
        const serializedTx = response.data.serializedTransaction;
        console.log('[Frontend] Received serialized transaction from backend.');

        const transaction = Transaction.from(Buffer.from(serializedTx, 'base64'));
        console.log('[Frontend] Transaction deserialized.');

        if (!transaction.feePayer?.equals(wallet.publicKey)) {
          console.warn(
            '[Frontend] Fee payer in the transaction does not match the connected wallet. This might be unexpected.',
            'Expected:',
            wallet.publicKey.toBase58(),
            'Got:',
            transaction.feePayer?.toBase58(),
          );
        }

        console.log('[Frontend] Requesting signature from wallet...');
        const signedTransaction = await wallet.signTransaction(transaction);
        console.log('[Frontend] Transaction signed by wallet.');

        console.log('[Frontend] Sending fully signed transaction to Solana network...');
        const sendOptions: SendOptions = { skipPreflight: false };
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
          sendOptions,
        );
        console.log('[Frontend] Transaction submitted. Signature:', signature);

        console.log('[Frontend] Confirming transaction...');
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash('confirmed');
        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash,
            lastValidBlockHeight,
          },
          'confirmed',
        );

        if (confirmation.value.err) {
          console.error('[Frontend] Transaction confirmation failed:', confirmation.value.err);
          throw new Error(`Помилка підтвердження транзакції: ${confirmation.value.err}`);
        }

        console.log('[Frontend] Transaction successfully confirmed!');
        options?.onSuccess?.({ signature });
      } else {
        const backendError =
          (response.data as any)?.error || 'Не вдалося отримати транзакцію з бекенду.';
        console.error(
          '[Frontend] Backend response error:',
          backendError,
          'Status:',
          response.status,
        );
        throw new Error(backendError);
      }
    } catch (error: any) {
      console.error('[Frontend] Error in startVesting process:', error);
      dispatch(setNftError({ fetchNft: error }));
      options?.onError?.(error);
    }
  };

export const selectNft = (state: RootState) => state.nft.nft;
export const selectNftErrors = (state: RootState) => state.nft.errors;

export const { setNft, setNftError } = nftSlice.actions;
export default nftSlice.reducer;
