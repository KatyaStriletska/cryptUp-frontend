import React, { FC, FormEvent, useEffect, useMemo, useState } from 'react';
import Modal, { ModalProps } from '../../molecules/Modal/Modal';
import { BN, web3 } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

interface TokenAccountInfo {
  pubkey: PublicKey;
  account: {
    data: web3.ParsedAccountData;
    executable: boolean;
    lamports: number;
    owner: PublicKey;
    rentEpoch?: number | undefined;
  };
}

export interface TradeFormData {
  userTokenAccount: TokenAccountInfo;
  amountToSell: string;
  expectedUsdcAmount: string;
}

export interface CreateTradeTokenModalProps extends Omit<ModalProps, 'onProcess'> {
  isOpen: boolean;
  userProTokens: TokenAccountInfo[];
  onProcessTrade: (data: TradeFormData) => Promise<void>;
  isSubmitting: boolean;
  submitError?: string | null;
}

interface CreateTradeTokenModalState {
  data: {
    selectedTokenAccountPubkey: string;
    amountToSell: string;
    expectedUsdcAmount: string;
  };
  localValidationError: string | null;
}

const initialState: CreateTradeTokenModalState = {
  data: {
    selectedTokenAccountPubkey: '',
    amountToSell: '',
    expectedUsdcAmount: '',
  },
  localValidationError: null,
};

const CreateTradeTokenModal: FC<CreateTradeTokenModalProps> = ({
  isOpen,
  title = 'Create Sell Proposal',
  onClose,
  userProTokens,
  onProcessTrade,
  isSubmitting,
  submitError,
  className,
  children,
}) => {
  const [state, setState] = useState<CreateTradeTokenModalState>(initialState);

  useEffect(() => {
    if (isOpen) {
      setState({ ...initialState, localValidationError: submitError ?? null });
    }
  }, [isOpen]);

  const selectedTokenAccountInfo = useMemo(() => {
    return userProTokens.find(
      token => token.pubkey.toBase58() === state.data.selectedTokenAccountPubkey,
    );
  }, [userProTokens, state.data.selectedTokenAccountPubkey]);

  const isDataValid = (data: CreateTradeTokenModalState['data']): boolean => {
    setState(prev => ({ ...prev, localValidationError: null }));
    if (!data.selectedTokenAccountPubkey) {
      setState(prev => ({ ...prev, localValidationError: 'Please select a token account.' }));
      return false;
    }

    const amountSell = parseFloat(data.amountToSell);
    if (isNaN(amountSell) || amountSell <= 0) {
      setState(prev => ({
        ...prev,
        localValidationError: 'Amount to sell must be a positive number.',
      }));
      return false;
    }

    if (selectedTokenAccountInfo) {
      const balanceStr =
        selectedTokenAccountInfo.account.data.parsed.info.tokenAmount.uiAmountString;
      const balanceNum = parseFloat(balanceStr);
      if (amountSell > balanceNum) {
        setState(prev => ({
          ...prev,
          localValidationError: `Amount exceeds balance (${balanceStr}).`,
        }));
        return false;
      }
    } else {
      setState(prev => ({
        ...prev,
        localValidationError: 'Selected token account info not found.',
      }));
      return false;
    }

    const amountUsdc = parseFloat(data.expectedUsdcAmount);
    if (isNaN(amountUsdc) || amountUsdc <= 0) {
      setState(prev => ({
        ...prev,
        localValidationError: 'Expected USDC amount must be a positive number.',
      }));
      return false;
    }

    return true;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (isDataValid(state.data) && selectedTokenAccountInfo) {
      if (isSubmitting) return;

      await onProcessTrade({
        userTokenAccount: selectedTokenAccountInfo,
        amountToSell: state.data.amountToSell,
        expectedUsdcAmount: state.data.expectedUsdcAmount,
      });
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    field: keyof CreateTradeTokenModalState['data'],
  ) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: event.target.value },
      localValidationError: null,
    }));
  };

  return (
    <Modal title={title} onClose={onClose} className={`max-w-[500px] ${className}`}>
      <form className='flex flex-col px-10 py-8' onSubmit={onSubmit}>
        {(state.localValidationError || submitError) && (
          <span className='bg-rose-100 border border-rose-200 p-2 rounded-md mb-6 font-mono text-sm'>
            {state.localValidationError || submitError}
          </span>
        )}

        <div className='flex flex-col gap-4'>
          {' '}
          <div className='flex flex-col'>
            <label
              htmlFor='tokenAccountSelectModal'
              className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
            >
              Sell From Account
            </label>
            <select
              id='tokenAccountSelectModal'
              value={state.data.selectedTokenAccountPubkey}
              onChange={e => handleInputChange(e, 'selectedTokenAccountPubkey')}
              required
              className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono'
            >
              <option value='' disabled>
                -- Select Account --
              </option>
              {userProTokens.map(tokenInfo => {
                const info = tokenInfo.account.data.parsed.info;
                const balance = info.tokenAmount.uiAmountString;
                const address = tokenInfo.pubkey.toBase58();
                return (
                  <option key={address} value={address}>
                    Acc: ...{address.slice(-6)} (Bal: {balance})
                  </option>
                );
              })}
            </select>
            {selectedTokenAccountInfo && (
              <div className='mt-1 text-sm text-gray-600'>
                Balance:{' '}
                {selectedTokenAccountInfo.account.data.parsed.info.tokenAmount.uiAmountString}{' '}
                (Decimals: {selectedTokenAccountInfo.account.data.parsed.info.tokenAmount.decimals})
              </div>
            )}
          </div>
          <div className='flex flex-col'>
            <label
              htmlFor='amountToSellModal'
              className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
            >
              Amount to Sell ('protoken')
            </label>
            <input
              id='amountToSellModal'
              type='number'
              value={state.data.amountToSell}
              onChange={e => handleInputChange(e, 'amountToSell')}
              placeholder='e.g., 100'
              required
              min='0'
              step='any'
              className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono'
            />
          </div>
          <div className='flex flex-col'>
            <label
              htmlFor='expectedUsdcModal'
              className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
            >
              Expected Price (USDC)
            </label>
            <input
              id='expectedUsdcModal'
              type='number'
              value={state.data.expectedUsdcAmount}
              onChange={e => handleInputChange(e, 'expectedUsdcAmount')}
              placeholder='e.g., 50'
              required
              min='0'
              step='any'
              className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono'
            />
          </div>
        </div>

        <div className='flex gap-4 mt-10'>
          <button
            type='submit'
            disabled={isSubmitting || !!state.localValidationError}
            className='inline-flex text-center justify-center items-center bg-zinc-900 border-2 border-transparent hover:border-zinc-900 hover:bg-transparent hover:text-zinc-900 text-white rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg disabled:opacity-60'
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
          <button
            type='button'
            className='inline-flex text-center justify-center items-center text-zinc-700 border-2 border-zinc-900 hover:text-zinc-900 hover:bg-slate-100 rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
            onClick={onClose}
            disabled={isSubmitting}
          >
            Close
          </button>
        </div>
      </form>
      {children}
    </Modal>
  );
};

export default CreateTradeTokenModal;
